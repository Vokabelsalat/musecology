import { useEffect, useRef, useState, cloneElement } from "react";

export const createProxyPhoto = (dummyLink) => {
  if (dummyLink) {
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          overflow: "hidden",
          backgroundImage: `url(${dummyLink.link})`,
          position: "relative"
        }}
      >
        <div
          className="proxyText"
          style={{
            fontSize: "small"
          }}
        >
          PROXY
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

export default function TimelineFront(props) {
  const { speciesName, imageLink, dummyLink, onClick } = props;

  return (
    <>
      {imageLink ? (
        <div
          className="cursor-pointer"
          onClick={onClick}
          style={{
            height: "100%",
            width: "100%",
            overflow: "hidden"
            // backgroundImage: `url(${imageLink[0].link})`
          }}
        >
          <img width={100} src={imageLink[0].link} />
        </div>
      ) : (
        dummyLink !== null && createProxyPhoto(dummyLink)
      )}
    </>
  );
}
