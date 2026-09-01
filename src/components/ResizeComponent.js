import { cloneElement } from "react";
import useResizeObserver from "use-resize-observer";

export default function ResizeComponent(props) {
  const { children } = props;

  const { ref, width = 1, height = 1 } = useResizeObserver();

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      {children !== undefined && width > 1 && height > 1 && (
        <>{cloneElement(children, { width: width, height: height })}</>
      )}
    </div>
  );
}
