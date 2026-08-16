import { useEffect, useRef } from "react";

export const useIntersection = (ref, selector, handler, options) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const { rootMargin, threshold } = options;

  useEffect(() => {
    const observers = [];

    if (ref.current && typeof IntersectionObserver === "function") {
      const handleIntersect = (idx) => (entries) => {
        handlerRef.current(entries[0], idx);
      };

      ref.current.querySelectorAll(selector).forEach((node, idx) => {
        const observer = new IntersectionObserver(
          handleIntersect(idx),
          { rootMargin, threshold }
        );
        observer.observe(node);
        observers.push(observer);
      });

      return () => {
        observers.forEach((observer) => {
          observer.disconnect();
        });
      };
    }
    return () => {};
  }, [ref, selector, threshold, rootMargin]);
};
