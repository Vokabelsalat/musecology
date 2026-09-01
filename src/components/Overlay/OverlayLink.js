import { cloneElement } from "react";

export default function OverlayLink(props) {
  const { children, setOverlayContent } = props;

  return (
    <a
      onClick={() => {
        setOverlayContent(children);
      }}
      style={{ cursor: "zoom-in" }}
    >
      {children}
    </a>
  );
}
