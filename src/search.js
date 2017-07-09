const aStar = require('a-star');
const distance = require('./distance');

const search = (graph, startId, endId) => {
  console.time('search');
  var path = aStar({
    start: startId,
    isEnd: function(node) {
      return node === endId;
    },
    neighbor: function(node) {
      return graph.neighbors(node);
    },
    distance: function(a, b) {
      return graph.getEdgeValue(a, b).distance;
    },
    heuristic: function(node) {
      const cost = distance(graph.getVertexValue(node), graph.getVertexValue(endId));
      return cost;
    }
  });
  if (path.status !== 'success') {
    throw new Error('No Path');
  }
  console.timeEnd('search');
  return path.path;
};

module.exports = search;