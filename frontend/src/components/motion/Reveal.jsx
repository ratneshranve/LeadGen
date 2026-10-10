import React, { useEffect, useRef, useState } from "react";

// Fades/rises its children into place the first time they scroll into view.
export const Reveal = ({ as: Tag = "div", delay = 0, className = "", style, children, ...rest }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // threshold 0 so even sections taller than the viewport still reveal
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`lg-reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--lg-delay": `${delay}s`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
};
