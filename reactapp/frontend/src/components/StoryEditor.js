import { useCallback, useState } from "react";
import Story from "./Story/Story";
import Navbar from "./Navbar";

const exampleStory = `[
  {
    "type": "storyTitle",
    "title": "My MusEcology story"
  },
  {
    "type": "text",
    "title": "A first chapter",
    "text": "Add your story text here."
  }
]`;

export default function StoryEditor({ width, height }) {
  const [jsonText, setJsonText] = useState(exampleStory);
  const [storyContents, setStoryContents] = useState(null);
  const [error, setError] = useState(null);

  const handlePreview = useCallback(
    (event) => {
      event.preventDefault();

      try {
        const parsedStory = JSON.parse(jsonText);

        if (!Array.isArray(parsedStory)) {
          throw new Error("The story JSON must be an array of story sections.");
        }

        if (parsedStory.length === 0) {
          throw new Error("Add at least one story section before previewing.");
        }

        setError(null);
        setStoryContents(parsedStory);
      } catch (parseError) {
        setError(parseError.message);
      }
    },
    [jsonText]
  );

  if (storyContents) {
    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <button
          type="button"
          className="absolute left-4 top-12 z-[10000] border border-[#ab6318] bg-[#fdfdfd] px-4 py-2 text-[#ab6318] transition-colors hover:bg-[#ab6318] hover:text-white rounded-md"
          style={{ fontFamily: "Source Sans Pro" }}
          onClick={() => setStoryContents(null)}
        >
          &larr; Edit JSON
        </button>
        <Story
          storyName="test"
          contents={storyContents}
          width={width}
          height={height}
        />
      </div>
    );
  }

  const isEmpty = jsonText.trim().length === 0;

  return (
    <main className="grid grid-rows-[40px_1fr] grid-cols-1 size-full">
      <Navbar />
      <div className="h-full w-full overflow-y-auto px-5 py-10 sm:px-10 sm:py-14"
      style={{ backgroundColor: "#fdfdfd", color: "#1c0f13" }}
      aria-labelledby="story-editor-title">
      <section className="mx-auto w-full max-w-5xl">
        <header className="mb-10">
          <h1
            id="story-editor-title"
            className="m-0 text-center font-normal leading-tight"
            style={{
              fontSize: "clamp(3rem, 7vw, 4.75rem)"
            }}
          >
            Story Editor
          </h1>
          <div
            className="mx-auto my-5"
            style={{ width: "72px", borderTop: "2px solid #ab6318" }}
          />
          <p
            className="mx-auto max-w-2xl text-lg text-justify leading-7"
            style={{ fontFamily: "Source Sans Pro", color: "#514b48" }}
          >
            Paste or edit a MusEcology story JSON array below, which cotains the different story sections, then choose Preview story
            to validate it and render the scrollytelling experience in this
            browser. Nothing is uploaded or saved.
          </p>
        </header>

        <form
          className="border-t border-stone-300 pt-7"
          onSubmit={handlePreview}
          noValidate
        >
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <label
              htmlFor="story-json"
              className="text-lg"
            >
              Story JSON
            </label>
            <span
              id="story-json-help"
              className="text-sm text-stone-500"
              style={{ fontFamily: "Source Sans Pro" }}
            >
              The top-level value must be an array of story sections.
            </span>
          </div>

          <textarea
            id="story-json"
            className={`min-h-[25rem] w-full resize-y border bg-[#faf9f6] p-5 font-mono text-sm leading-6 text-stone-900 outline-none transition-colors focus:border-[var(--highlightpurple)] ${
              error
                ? "border-red-600 focus:border-red-600"
                : "border-stone-400"
            }`}
            value={jsonText}
            onChange={(event) => {
              setJsonText(event.target.value);
              if (error) setError(null);
            }}
            // placeholder={exampleStory}
            aria-describedby={
              error
                ? "story-json-help story-json-error"
                : "story-json-help"
            }
            aria-invalid={Boolean(error)}
            spellCheck={false}
          />

          <div className="mt-3 min-h-6">
            {error && (
              <p
                id="story-json-error"
                className="text-sm text-red-700"
                style={{ fontFamily: "Source Sans Pro" }}
                role="alert"
              >
                Could not preview this story: {error}
              </p>
            )}
          </div>

          <div className="mt-5 flex justify-end border-t border-stone-300 pt-5">
            <button
              type="submit"
              disabled={isEmpty}
              className="border-2 border-[#ab6318] bg-[#ab6318] px-6 py-2.5 text-white transition-colors hover:bg-[#8e4f16] focus:border-[var(--highlightpurple)] focus:outline-none disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-200 disabled:text-stone-500 rounded-md"
              style={{ fontFamily: "Source Sans Pro", fontSize: "1rem" }}
            >
              Preview story
            </button>
          </div>
        </form>
      </section>
      </div>
    </main>
  );
}
