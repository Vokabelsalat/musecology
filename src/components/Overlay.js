import { useContext } from "react";
import { OverlayContext } from "./OverlayProvider";

export default function Overlay() {
  const [overlay, setOverlay] = useContext(OverlayContext);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 5000,
        display: overlay ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(200, 200, 200, 0.7)",
        cursor: "zoom-out"
      }}
      onClick={(e) => {
        setOverlay(null);
      }}
    >
      <div
        aria-modal="true"
        role="dialog"
        style={{
          zIndex: 5001,
          backgroundColor: "white",
          cursor: "initial"
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {overlay}
      </div>
    </div>
  );
}
