import { Fragment, useCallback, useMemo, useState } from "react";
import ThreatIcon from "./ThreatIcon";

const transformWikimediaURL = (url) => {
  if (url.includes("/")) {
    const lastSlashIndex = url.lastIndexOf("/"); // Find the last "/"
    if (lastSlashIndex === -1) return null;

    const filename = url.substring(lastSlashIndex + 1); // Extract filename
    return `https://commons.wikimedia.org/wiki/File:${filename}`;
  } else {
    return url;
  }
};

export default function TreeMapTile(props) {
  const {
    node,
    parentTop = 0,
    parentLeft = 0,
    getTreeThreatLevel,
    colorBlind
  } = props;

  const getMaxChild = (children) => {
    const sorted = children.sort((a, b) => {
      if (a.data.image && b.data.image) {
        return b.value - a.value;
      } else if (a.data.image && !b.data.image) {
        return -1;
      } else if (b.data.image && !a.data.image) {
        return 1;
      } else {
        return b.value - a.value;
      }
    });
    const max = sorted[0];
    if (max.children) {
      return getMaxChild(max.children);
    } else {
      return max;
    }
  };

  const max = node.children ? getMaxChild(node.children) : node;

  const getCoverPhoto = useCallback(() => {
    if (max.data.image != null) {
      return (
        <img
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
          src={max.data.image}
        />
      );
    } else {
      return null;
    }
  }, []);

  const speciesLevel =
    node.data.mediaUrls != null && node.parent == null ? true : false;

  const isGenusOrSpeciesView =
    node.parent == null ||
    (node.parent.data.filterDepth === 3 && node.parent.parent == null);
  const showThreatIcon =
    node.data.filterDepth === 4 &&
    isGenusOrSpeciesView &&
    getTreeThreatLevel != null;
  const economicThreat = showThreatIcon
    ? getTreeThreatLevel(node.data.name, "economically")
    : null;
  const ecologicalThreat = showThreatIcon
    ? getTreeThreatLevel(node.data.name, "ecologically")
    : null;

  let content = <></>;

  const [visibleIndex, setVisibleIndex] = useState(0);

  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg)$/i;

  const photos = useMemo(() => {
    const ph = [];

    if (max.data.image) {
      for (const photo of max.data.image) {
        ph.push({
          type: "cover",
          src: photo.link,
          author: photo.source,
          source: photo.source
        });
      }
    } else if (max.data.proxy) {
      ph.push({
        type: "proxy",
        src: max.data.proxy.link,
        author: max.data.proxy.source,
        source: max.data.proxy.source
      });
    }

    if (speciesLevel && max.data.mediaUrls) {
      ph.push(
        ...max.data.mediaUrls
          .filter((e) => {
            return imageExtensions.test(e.link);
          })
          .map((e) => {
            return {
              type: "wiki",
              src: e.link,
              author: e.author,
              license: e.license
            };
          })
      );
    }

    return ph;
  }, [max, speciesLevel]);

  content = useMemo(() => {
    const photoIndex = visibleIndex % photos.length;
    if (photos[photoIndex] == null) return null;

    let extended = false;
    let link = null;
    let text = photos[photoIndex].source;

    if (
      photos[photoIndex].source ===
      "Thünen Institut - Wood collection of Dr. Wolfgang Mautz"
    ) {
      extended = true;
      link =
        "https://www.thuenen.de/de/thuenen-institut/verbundstrukturen/thuenen-kompetenzzentrum-holzherkuenfte/die-wissenschaftliche-holzsammlung-xylothek-1";
    } else if (photos[photoIndex].type === "wiki") {
      link = transformWikimediaURL(photos[photoIndex].src ?? "");
      const author =
        photos[photoIndex].author != null && photos[photoIndex].author !== ""
          ? photos[photoIndex].author.replace(/<[^>]+>/g, "")
          : "";

      const license =
        photos[photoIndex].license != null && photos[photoIndex].license !== ""
          ? photos[photoIndex].license.replace(/<[^>]+>/g, "")
          : "";

      text = [author, license].join(", ");
    } else {
      text = photos[photoIndex].author;
    }

    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          display: "flex"
        }}
      >
        {[...photos].map((entry, index) => {
          return (
            <Fragment key={`MaterialViewPhoto-${index}`}>
              <img
                style={{
                  display: photoIndex === index ? "block" : "none",
                  width: "100%",
                  height: "100%",
                  objectFit: speciesLevel ? "contain" : "unset",
                  boxSizing: "border-box"
                }}
                src={entry.src}
                alt={`Material View ${index}`}
              />
              {entry.type === "proxy" && <div className="proxyText">PROXY</div>}
            </Fragment>
          );
        })}
        {speciesLevel && photos.length > 1 && (
          <>
            <div
              className="imageSliderButtonDiv imageSliderButtonDivLeft"
              onClick={() => {
                setVisibleIndex(visibleIndex - 1);
              }}
            >
              <div className="chevronLeft"></div>
            </div>
            <div
              className="imageSliderButtonDiv imageSliderButtonDivRight"
              onClick={() => {
                setVisibleIndex(visibleIndex + 1);
              }}
            >
              <div className="chevronRight"></div>
            </div>
          </>
        )}
        {speciesLevel && photos[photoIndex] !== undefined && (
          <div
            className={`${
              extended ? "w-fit" : "w-min"
            } absolute top-1 left-1 text-sm bg-slate-50/75 rounded-full h-5 hover:w-fit flex items-center justify-center group px-1`}
          >
            &copy;
            <span
              className={`${
                extended ? "flex" : "hidden group-hover:flex"
              } overflow-hidden text-xs px-1`}
            >
              <a
                target="_blank"
                href={link}
                className="text-[var(--highlightpurple)] underline"
              >
                {text}
              </a>
            </span>
          </div>
        )}
      </div>
    );
  }, [photos, speciesLevel, visibleIndex]);

  return (
    <div
      style={{
        position: "absolute",
        left: node.x0 - parentLeft,
        top: node.y0 - parentTop,
        width: node.x1 - node.x0,
        height: node.y1 - node.y0,
        backgroundColor: "#a2a2a2",
        overflow: "hidden"
      }}
    >
      {content}
      {showThreatIcon && (
        <div
          // className="border border-[lightgray] rounded-full bg-white p-[1px]"
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            zIndex: 1,
            pointerEvents: "none",
            transform: node.parent == null ? "scale(1.5)" : "none",
            transformOrigin: "bottom right"
          }}
        >
          <ThreatIcon
            leftColor={economicThreat.getColor(colorBlind)}
            rightColor={ecologicalThreat.getColor(colorBlind)}
            isAnimal={node.data.isAnimal}
            shadow
          />
        </div>
      )}
    </div>
  );
}
