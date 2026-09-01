import { cloneElement } from "react";

export default function Overlay(props) {
  const { open = false, onClose, children } = props;

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "rgb(255, 255, 255, 0.75)",
        display: open ? "flex" : "none",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0,
        cursor: "zoom-out"
      }}
      onClick={onClose}
    >
      <div
        style={{
          height: "80vh",
          zIndex: 500
        }}
        className="overlay"
      >
        {children !== null && <>{cloneElement(children)}</>}
      </div>
    </div>
  );
}
