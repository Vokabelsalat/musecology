import * as d3 from "d3";
import { useState } from "react";
import TreeMapLevel from "./TreeMapLevel";

export default function TreeMap(props) {
  const { width, height, data, filterTreeMap, headerOffset = 0 } = props;

  var root = d3
    .hierarchy(data)
    .sum(function (d) {
      return d.value;
    })
    .sort(function (a, b) {
      return a.value - b.value;
    }); // Here the size of each leave is given in the 'value' field in input data

  // Then d3.treemap computes the position of each element of the hierarchy
  d3.treemap().size([width, height - headerOffset])(root);

  return (
    <div
      style={{
        width: width,
        height: height - headerOffset,
        backgroundColor: "white",
        position: "relative"
      }}
    >
      {root.children ? (
        root.children.map((node, index) => {
          return (
            <TreeMapLevel
              key={`treeMapLevel${node.data.name}${index}`}
              node={node}
              filterTreeMap={filterTreeMap}
            />
          );
        })
      ) : (
        <TreeMapLevel
          key={`treeMapLevel${root.data.name}${0}`}
          node={root}
          filterTreeMap={filterTreeMap}
        />
      )}
    </div>
  );
}
