import { createElement } from "react";

const TAG_PATTERN = /<\s*(\/?)\s*(b|i|u|br|a)\b([^>]*?)\/?\s*>/gi;
const ATTRIBUTE_PATTERN = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#)/i;

function parseLinkProps(attributes) {
  const props = {};
  for (const [, name, double, single] of attributes.matchAll(ATTRIBUTE_PATTERN)) {
    props[name.toLowerCase()] = double ?? single;
  }

  const href = props.href?.trim();
  const linkProps = {
    href: href && SAFE_HREF.test(href) ? href : undefined,
    className: "underline",
  };
  if (props.target === "_blank" || /^https?:/i.test(href ?? "")) {
    linkProps.target = "_blank";
    linkProps.rel = "noopener noreferrer";
  }
  return linkProps;
}

// Parses a string containing <b>, <i>, <u>, <a href="..."> and line breaks
// (<br>, <br/>, </br>) into React nodes. Tags can be nested; unclosed tags are
// closed at the end.
export default function parseFormattedText(text) {
  if (typeof text !== "string") return text;

  const root = { tag: null, children: [] };
  const stack = [root];
  let lastIndex = 0;
  let key = 0;

  const current = () => stack[stack.length - 1];
  const pushText = (value) => {
    if (value) current().children.push(value);
  };

  for (const match of text.matchAll(TAG_PATTERN)) {
    pushText(text.slice(lastIndex, match.index));
    lastIndex = match.index + match[0].length;

    const isClosing = match[1] === "/";
    const tag = match[2].toLowerCase();

    if (tag === "br") {
      current().children.push(createElement("br", { key: `br-${key++}` }));
    } else if (!isClosing) {
      const props = tag === "a" ? parseLinkProps(match[3]) : {};
      stack.push({ tag, props, children: [] });
    } else {
      const openIndex = stack.findLastIndex((node) => node.tag === tag);
      if (openIndex <= 0) continue;
      while (stack.length > openIndex) closeNode();
    }
  }

  pushText(text.slice(lastIndex));
  while (stack.length > 1) closeNode();

  return root.children;

  function closeNode() {
    const node = stack.pop();
    current().children.push(
      createElement(node.tag, { ...node.props, key: `${node.tag}-${key++}` }, ...node.children)
    );
  }
}
