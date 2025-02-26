import { Fragment, useCallback, useMemo, useState } from "react";

export default function TreeMapTile(props) {
  const { node, parentTop = 0, parentLeft = 0 } = props;

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

  const getProxyPhoto = useCallback(() => {
    if (max.data.proxy != null) {
      return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <img
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
            src={max.data.proxy}
          />
          <div className="proxyText">PROXY</div>
        </div>
      );
    } else {
      return null;
    }
  }, [max]);

  const speciesLevel =
    node.data.mediaUrls != null && node.parent == null ? true : false;

  let content = <></>;

  const [visibleIndex, setVisibleIndex] = useState(0);

  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg)$/i;

  const photos = useMemo(() => {
    const ph = [];

    if (max.data.image) {
      for (const photo of max.data.image) {
        ph.push({ type: "cover", src: photo.link });
      }
    } else if (max.data.proxy) {
      ph.push({ type: "proxy", src: max.data.proxy.link });
    }

    if (speciesLevel && max.data.mediaUrls) {
      ph.push(
        ...max.data.mediaUrls
          .filter((e) => {
            return imageExtensions.test(e);
          })
          .map((e) => {
            return { type: "wiki", src: e };
          })
      );
    }

    return ph;
  }, [max, speciesLevel]);

  content = (
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
                display:
                  visibleIndex % photos.length === index ? "block" : "none",
                width: speciesLevel ? "auto" : "100%",
                height: "100%",
                objectFit: speciesLevel ? "unset" : "cover"
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
    </div>
  );
  /* } */

  return (
    <div
      style={{
        position: "absolute",
        left: node.x0 - parentLeft,
        top: node.y0 - parentTop,
        width: node.x1 - node.x0,
        height: node.y1 - node.y0,
        backgroundColor: "gray",
        overflow: "hidden"
      }}
    >
      {content}
    </div>
  );
}
