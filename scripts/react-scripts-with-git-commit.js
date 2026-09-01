const { spawn, spawnSync } = require("child_process");

const supportedCommands = new Set(["start", "build", "test"]);
const command = process.argv[2];

if (!supportedCommands.has(command)) {
  console.error("Expected one of: start, build, test.");
  process.exit(1);
}

let commitSha = process.env.REACT_APP_GIT_COMMIT;
let hasLocalChanges = process.env.REACT_APP_GIT_DIRTY;

if (!commitSha) {
  const gitResult = spawnSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8"
  });

  if (gitResult.status === 0) {
    commitSha = gitResult.stdout.trim();
  } else {
    console.warn(
      "Git commit information is unavailable; the Updates feed will remain disabled."
    );
  }
}

if (hasLocalChanges == null) {
  const statusResult = spawnSync("git", ["status", "--porcelain"], {
    encoding: "utf8"
  });
  hasLocalChanges =
    statusResult.status === 0 && statusResult.stdout.trim().length > 0
      ? "true"
      : "false";
}

const reactScriptsPath = require.resolve("react-scripts/bin/react-scripts.js");
const child = spawn(
  process.execPath,
  [reactScriptsPath, command, ...process.argv.slice(3)],
  {
    env: {
      ...process.env,
      REACT_APP_GIT_COMMIT: commitSha || "",
      REACT_APP_GIT_DIRTY: hasLocalChanges
    },
    stdio: "inherit"
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
