import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon
} from "@heroicons/react/24/solid";

export default function FullScreenButton(props) {
  const { scaleString, onClick, setTooltip } = props;

  return (
    <button
      style={{
        position: "absolute",
        right: 5,
        top: 5,
        backgroundColor: "transparent",
        border: "none"
      }}
      onClick={onClick}
      onMouseEnter={(event) => {
        if (setTooltip)
          setTooltip({ tooltipText: "Enter Fullscreen", tooltipMode: "text" });
      }}
      onMouseLeave={(event) => {
        if (setTooltip) setTooltip(null);
      }}
    >
      {scaleString !== "" ? (
        <ArrowsPointingInIcon
          style={{
            width: "15px",
            height: "15px"
          }}
        />
      ) : (
        <ArrowsPointingOutIcon
          style={{
            width: "15px",
            height: "15px"
          }}
        />
      )}
    </button>
  );
}
