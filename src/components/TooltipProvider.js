import {
  defaultStyles,
  TooltipWithBounds,
  useTooltip,
  useTooltipInPortal
} from "@visx/tooltip";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";
import Tooltip from "./TooltipNew";

const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: "rgba(248,248,248,1.0)",
  color: "#171717",
  padding: 6
  /* WebkitBoxShadow:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  MozBoxShadow:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  boxShadow:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" */
};

export const TooltipContext = createContext(null);

export function TooltipProvider(props) {
  const { children, speciesLabels } = props;
  const [content, setContent] = useState(null);

  const { containerRef, containerBounds } = useTooltipInPortal({
    scroll: true,
    detectBounds: true
  });

  const value = useMemo(() => {
    const setTooltip = (content) => {
      setContent(content);
    };
    return { content, setTooltip };
  }, [content]);

  const {
    showTooltip,
    tooltipLeft = 0,
    tooltipTop = 0
  } = useTooltip({
    // initial tooltip state
    tooltipOpen: true,
    tooltipLeft: 0,
    tooltipTop: 0,
    tooltipData: null
  });

  const handlePointerMove = useCallback(
    (event) => {
      // coordinates should be relative to the container in which Tooltip is rendered
      const containerX =
        ("clientX" in event ? event.clientX : 0) - containerBounds.left;
      const containerY =
        ("clientY" in event ? event.clientY : 0) - containerBounds.top;
      showTooltip({
        tooltipLeft: containerX,
        tooltipTop: containerY
      });
    },
    [showTooltip, containerBounds]
  );

  const TooltipComponent = TooltipWithBounds;

  return (
    <TooltipContext.Provider value={value}>
      <div
        id="tooltipProviderWrapper"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          left: 0,
          top: 0,
          overflow: "hidden"
        }}
      >
        <div
          id="tooltipProvider"
          ref={containerRef}
          onPointerMove={handlePointerMove}
          className="relative w-full h-full overflow-hidden z-[40]"
        >
          {content && (
            <TooltipComponent
              key={"tooltipComponent"} // needed for bounds to update correctly
              left={tooltipLeft}
              top={tooltipTop}
              style={tooltipStyles}
              className={`z-[41] ${content != null ? "visible" : "hidden"}`}
            >
              <Tooltip
                tooltipMode={content.tooltipMode ?? null}
                tooltipText={content.tooltipText ?? null}
                tooltipOptions={content.tooltipOptions ?? null}
                speciesLabels={speciesLabels}
              />
            </TooltipComponent>
          )}
          {children}
        </div>
      </div>
    </TooltipContext.Provider>
  );
}
