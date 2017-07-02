const buildNodeIndex = (g, xml, roadNodes, isFirstOrLast) => {
  return new Promise((resolve, reject) => {
    const nodesIndex = {};
    xml.collect('tag');
    xml.on('endElement: node', item => {
      const osmId = item.$.id;
      if (!isFirstOrLast[osmId]) {
        return;
      }
      const deadEnd = (isFirstOrLast[osmId][0] === 1 && isFirstOrLast[osmId][1] === 0)
        || (isFirstOrLast[osmId][0] === 0 && isFirstOrLast[osmId][1] === 1);
      if (roadNodes[osmId] > 1 || (roadNodes[osmId] === 0 && deadEnd)) {
        const node = {
          id: osmId,
          location: [Number(item.$.lon), Number(item.$.lat)],
          firstEdgeId: -1,
        };
        g.addVertex(node.id);
        g.setVertexValue(node.id, node);
        nodesIndex[node.id] = true;
      }
    });
    xml.on('end', () => {
      resolve(nodesIndex);
    });
  });
}

module.exports = buildNodeIndex;