import { useEffect, useState } from "react";

export default function InstrumentPhotoCarousel({ photos }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [photos]);

  if (photos == null || photos.length === 0) return null;

  const photoIndex = ((index % photos.length) + photos.length) % photos.length;
  const photo = photos[photoIndex];
  const credit = [photo.author, photo.license]
    .filter((e) => e != null && e !== "")
    .join(", ");

  return (
    <div>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          backgroundColor: "#a2a2a2",
          overflow: "hidden"
        }}
      >
        <img
          src={photo.thumb}
          alt={photo.title.replace(/^File:/, "").replace(/\.[^.]+$/, "")}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
        {photos.length > 1 && (
          <>
            <div
              className="imageSliderButtonDiv imageSliderButtonDivLeft cursor-pointer"
              onClick={() => setIndex(photoIndex - 1)}
            >
              <div className="chevronLeft"></div>
            </div>
            <div
              className="imageSliderButtonDiv imageSliderButtonDivRight cursor-pointer"
              onClick={() => setIndex(photoIndex + 1)}
            >
              <div className="chevronRight"></div>
            </div>
          </>
        )}
        <div className="w-min absolute top-1 left-1 text-sm bg-slate-50/75 rounded-full h-5 hover:w-fit flex items-center justify-center group px-1">
          &copy;
          <span className="hidden group-hover:flex overflow-hidden text-xs px-1">
            <a
              target="_blank"
              rel="noreferrer"
              href={photo.page}
              className="text-[var(--highlightpurple)] underline whitespace-nowrap"
            >
              {credit !== "" ? credit : "Wikimedia Commons"}
            </a>
          </span>
        </div>
      </div>
      {photos.length > 1 && (
        <div className="flex justify-end gap-1 pt-1.5">
          {photos.map((p, i) => (
            <div
              key={p.title}
              onClick={() => setIndex(i)}
              className="w-2 h-2 rounded-full cursor-pointer"
              style={{
                backgroundColor:
                  i === photoIndex ? "var(--highlightpurple)" : "#a2a2a2"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
