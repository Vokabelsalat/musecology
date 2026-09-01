import TreeMap from "./TreeMapNew";
import TreeMapHeader from "./TreeMapHeader";
import { useState } from "react";

export default function TreeMapView(props) {
  const { width, height, data, treeMapFilter, setTreeMapFilter } = props;

  const { kingdom, family, genus, species } = treeMapFilter;

  const [rootNode, setRootNode] = useState();

  const filterTreeMap = (node) => {
    const level = node ? node.data.filterDepth : 0;

    let newTreeMapFilter = { ...treeMapFilter };

    switch (level) {
      case 0:
        newTreeMapFilter["kingdom"] = null;
        newTreeMapFilter["family"] = null;
        newTreeMapFilter["genus"] = null;
        newTreeMapFilter["species"] = null;
        break;
      case 1:
        newTreeMapFilter["kingdom"] = node.data.name;
        newTreeMapFilter["family"] = null;
        newTreeMapFilter["genus"] = null;
        newTreeMapFilter["species"] = null;
        break;
      case 2:
        newTreeMapFilter["family"] = node.data.name;
        newTreeMapFilter["genus"] = null;
        newTreeMapFilter["species"] = null;
        break;
      case 3:
        newTreeMapFilter["genus"] = node.data.name;
        newTreeMapFilter["species"] = null;
        break;
      case 4:
        newTreeMapFilter["species"] = node.data.name;
        break;
      default:
        break;
    }

    setTreeMapFilter(newTreeMapFilter);
    setRootNode(node);
  };

  const filterData = (i_data, i_filter) => {
    if (
      i_data.filterDepth === i_filter.data.filterDepth &&
      i_data.name === i_filter.data.name
    ) {
      return i_data;
    } else {
      if (i_data.children && i_data.filterDepth < i_filter.data.filterDepth) {
        let test = i_data.children.map((e) => {
          return filterData(e, i_filter);
        });
        return test.find(
          (element) => element !== null && element !== undefined
        );
      } else {
        return null;
      }
    }
  };

  let tmpData = data;

  if (rootNode) {
    tmpData = filterData(data, rootNode);
  } else {
    let level = 0;
    let name = "";
    if (species) {
      level = 4;
      name = species;
    } else if (genus) {
      level = 3;
      name = genus;
    } else if (family) {
      level = 2;
      name = family;
    } else if (kingdom) {
      level = 1;
      name = kingdom;
    } else {
      level = 0;
    }

    let test = filterData(data, {
      data: { name: name, filterDepth: level }
    });

    if (test) {
      tmpData = test;
    }
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        display: "grid",
        gridTemplateRows: "auto auto",
        gridTemplateColumns: "auto"
      }}
    >
      <TreeMapHeader
        kingdom={kingdom}
        genus={genus}
        family={family}
        species={species}
        filterTreeMap={filterTreeMap}
      />
      <TreeMap
        width={width}
        height={height}
        data={tmpData}
        headerOffset={kingdom ? 48 : 0}
        filterTreeMap={filterTreeMap}
      />
    </div>
  );
}
