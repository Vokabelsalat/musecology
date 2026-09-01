import TreeMapTile from "./TreeMapTile";

export default function TreeMapLevel(props) {
  const { node, filterTreeMap } = props;

  return (
    <div
      style={{
        position: "absolute",
        left: node.x0,
        top: node.y0,
        width: node.x1 - node.x0,
        height: node.y1 - node.y0
      }}
      onClick={() => {
        filterTreeMap(node);
      }}
      className="treeMapLevel"
    >
      {node.children ? (
        node.children
          .sort((a, b) => {
            return a.value - b.value;
          })
          .map((leave, index) => {
            return (
              <TreeMapTile
                key={`treeMapTile${leave.data.name}`}
                parentTop={node.y0}
                parentLeft={node.x0}
                node={leave}
              />
            );
          })
      ) : (
        <TreeMapTile
          key={`treeMapTile${node.data.name}`}
          parentTop={node.y0}
          parentLeft={node.x0}
          node={node}
        />
      )}
      <div className="mapTileText">
        {node.data.filterDepth === 4
          ? `${node.data.name.slice(node.data.name.indexOf(" ") + 1)}`
          : `${node.data.name} ${node.value}`}
      </div>
    </div>
  );
}
