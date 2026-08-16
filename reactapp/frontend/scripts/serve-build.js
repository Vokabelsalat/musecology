const fs = require("fs");
const http = require("http");
const path = require("path");

const buildDirectory = path.resolve(__dirname, "..", "build");
const host = process.env.HOST || "127.0.0.1";
const port = Number.parseInt(process.env.PORT || "3050", 10);

const contentTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".ogg": "audio/ogg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".wav": "audio/wav",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT: ${process.env.PORT}`);
}

if (!fs.existsSync(path.join(buildDirectory, "index.html"))) {
  throw new Error("The production build is missing. Run `npm run build` first.");
}

function sendFile(request, response, filePath) {
  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found\n");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const etag = `W/\"${stats.size.toString(16)}-${Math.trunc(stats.mtimeMs).toString(16)}\"`;
    const headers = {
      "Content-Type": contentTypes[extension] || "application/octet-stream",
      "Content-Length": stats.size,
      "Accept-Ranges": "bytes",
      ETag: etag,
      "Last-Modified": stats.mtime.toUTCString(),
      "X-Content-Type-Options": "nosniff"
    };

    if (filePath === path.join(buildDirectory, "index.html")) {
      headers["Cache-Control"] = "no-cache";
    } else if (filePath.startsWith(path.join(buildDirectory, "static") + path.sep)) {
      headers["Cache-Control"] = "public, max-age=31536000, immutable";
    }

    if (request.headers["if-none-match"] === etag) {
      response.writeHead(304, headers);
      response.end();
      return;
    }

    const range = request.headers.range;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      let start;
      let end;

      if (match && match[1]) {
        start = Number.parseInt(match[1], 10);
        end = match[2] ? Number.parseInt(match[2], 10) : stats.size - 1;
      } else if (match && match[2]) {
        const suffixLength = Number.parseInt(match[2], 10);
        start = Math.max(stats.size - suffixLength, 0);
        end = stats.size - 1;
      }

      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        start < 0 ||
        start > end ||
        start >= stats.size
      ) {
        response.writeHead(416, {
          "Content-Range": `bytes */${stats.size}`,
          "Content-Type": "text/plain; charset=utf-8"
        });
        response.end("Range not satisfiable\n");
        return;
      }

      end = Math.min(end, stats.size - 1);
      headers["Content-Range"] = `bytes ${start}-${end}/${stats.size}`;
      headers["Content-Length"] = end - start + 1;
      response.writeHead(206, headers);
      if (request.method === "HEAD") {
        response.end();
        return;
      }
      fs.createReadStream(filePath, { start, end }).pipe(response);
      return;
    }

    response.writeHead(200, headers);
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, {
      Allow: "GET, HEAD",
      "Content-Type": "text/plain; charset=utf-8"
    });
    response.end("Method not allowed\n");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad request\n");
    return;
  }

  const requestedPath = path.resolve(buildDirectory, `.${pathname}`);
  const isInsideBuild =
    requestedPath === buildDirectory || requestedPath.startsWith(buildDirectory + path.sep);

  if (!isInsideBuild) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden\n");
    return;
  }

  fs.stat(requestedPath, (statError, stats) => {
    if (!statError && stats.isFile()) {
      sendFile(request, response, requestedPath);
      return;
    }

    // BrowserRouter routes do not have file extensions. Serve the app shell for them.
    if (!path.extname(pathname)) {
      sendFile(request, response, path.join(buildDirectory, "index.html"));
      return;
    }

    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found\n");
  });
});

server.listen(port, host, () => {
  console.log(`Musecology frontend listening on http://${host}:${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down`);
  server.close((error) => {
    process.exit(error ? 1 : 0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
