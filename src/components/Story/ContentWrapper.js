import { forwardRef } from "react";
// import { useOnParent } from "./useOnParent";

const ContentWrapper = forwardRef((props, ref) => {
  const { children, style, id } = props;

  /* const myref = useRef(ref); */

  return (
    <div
      id={id}
      ref={ref}
      className={`contentWrapper`}
      style={{
        ...style,
        width: "100%",
        marginBottom: "10px",
        position: "relative",
        transition: "opacity 0.5s",
        paddingRight: "10px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
      }}
    >
      {children}
    </div>
  );
});

ContentWrapper.displayName = "ContentWrapper";

export default ContentWrapper;
