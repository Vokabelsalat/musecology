import { useMemo, useState, createContext } from "react";

export const OverlayContext = createContext();

export function OverlayProvider(props) {
  const { children } = props;
  const [overlay, setOverlay] = useState();
  const value = useMemo(() => [overlay, setOverlay], [overlay]);

  return (
    <OverlayContext.Provider value={value}>
      {children}
    </OverlayContext.Provider>
  );
}
