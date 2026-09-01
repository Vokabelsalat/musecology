import { useEffect, useState } from "react";
import NavbarOverlayPanel from "./NavbarOverlayPanel";

const buildCommitSha = process.env.REACT_APP_GIT_COMMIT;
const buildHasLocalChanges = process.env.REACT_APP_GIT_DIRTY === "true";

const formatCommitDate = (date) => {
  if (!date) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
};

const getCommitMessage = (commit) => {
  const [title, ...bodyLines] = commit.commit.message.split("\n");
  return {
    title,
    body: bodyLines.join("\n").trim()
  };
};

export default function UpdatesOverlayContent({ content }) {
  const [commits, setCommits] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCommits() {
      if (!buildCommitSha) {
        setError("This build does not contain Git commit information.");
        setIsLoading(false);
        return;
      }

      try {
        const commitsUrl = new URL(content.commitsEndpoint);
        commitsUrl.searchParams.set("sha", buildCommitSha);
        commitsUrl.searchParams.set("per_page", "10");

        const response = await fetch(commitsUrl, {
          headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
          },
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`GitHub returned status ${response.status}.`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("GitHub returned an unexpected response.");
        }

        setCommits(data);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(loadError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadCommits();
    return () => controller.abort();
  }, [content.commitsEndpoint]);

  return (
    <NavbarOverlayPanel title={content.title}>
      <p className="mb-5 leading-6 text-gray-700">{content.description}</p>

      {buildCommitSha && (
        <p className="mb-5 text-sm text-gray-500">
          This instance is based on commit{" "}
          <a
            className="font-mono text-[var(--highlightpurple)] hover:underline"
            href={`${content.repositoryHref}/commit/${buildCommitSha}`}
            target="_blank"
            rel="noreferrer"
          >
            {buildCommitSha.slice(0, 7)}
          </a>
          {buildHasLocalChanges
            ? " and includes local uncommitted changes."
            : "."}
        </p>
      )}

      {isLoading && (
        <p aria-live="polite" className="py-6 text-center text-gray-600">
          Loading updates…
        </p>
      )}

      {error && (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800"
          role="alert"
        >
          <p className="font-semibold">Updates could not be loaded.</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {!isLoading && !error && commits.length === 0 && (
        <p className="py-6 text-center text-gray-600">
          No commits were found on this branch.
        </p>
      )}

      {!isLoading && !error && commits.length > 0 && (
        <ol className="divide-y divide-gray-200">
          {commits.map((commit) => {
            const message = getCommitMessage(commit);
            const author =
              commit.commit.author?.name ||
              commit.author?.login ||
              "Unknown author";

            return (
              <li className="py-4 first:pt-0" key={commit.sha}>
                <a
                  className="font-semibold leading-6 text-[var(--highlightpurple)] hover:underline"
                  href={commit.html_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {message.title}
                </a>
                {message.body && (
                  <p className="mt-1 whitespace-pre-line text-sm leading-5 text-gray-700">
                    {message.body}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  <span>{author}</span>
                  <span aria-hidden="true"> · </span>
                  <time dateTime={commit.commit.author?.date}>
                    {formatCommitDate(commit.commit.author?.date)}
                  </time>
                  <span aria-hidden="true"> · </span>
                  <span className="font-mono">{commit.sha.slice(0, 7)}</span>
                </p>
              </li>
            );
          })}
        </ol>
      )}

      <a
        className="mt-5 inline-block text-sm font-semibold text-[var(--highlightpurple)] hover:underline"
        href={content.branchHref}
        target="_blank"
        rel="noreferrer"
      >
        View all {content.branchName} commits on GitHub
      </a>
    </NavbarOverlayPanel>
  );
}
