import { positions } from "@mui/system";
import { forwardRef, Children, cloneElement } from "react";

const ContentPanel = forwardRef((props, ref) => {
  const { children, className } = props;

  return (
    <div
      className={className}
      ref={ref}
      style={{
        width: `100%`,
        height: `100%`,
        overflow: "hidden",
        overflowY: "scroll"
        /* scrollSnapType: "y proximity" */
      }}
    >
      {children}
    </div>
  );
});

ContentPanel.displayName = "ContentPanel";

export default ContentPanel;
