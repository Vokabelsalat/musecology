import { useMemo, useState, createContext } from "react";

export const HoverContext = createContext();

export function HoverProvider(props) {
  const { children } = props;

  const [user, setUser] = useState("Jesse Hall");
  const value = useMemo(() => [user, setUser], [user]);

  return (
    <HoverContext.Provider value={value}>
      {children}
    </HoverContext.Provider>
  );
}
