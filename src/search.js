const aStar = require('a-star');
const distance = require('@turf/distance');

const search = (graph, startId, endId) => {
  var path = aStar({
    start: startId,
    isEnd: function(node) {
      return node === endId;
    },
    neighbor: function(node) {
      return graph.neighbors(node);
    },
    distance: function(a, b) {
      return 1;
    },
    heuristic: function(node) {
      const from = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: graph.getVertexValue(node).location,
        }
      };
      const to = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: graph.getVertexValue(endId).location,
        }
      };

      const units = 'meters';
      const cost = distance(from, to, units);
      return cost;
    }
  });
  if (path.status !== 'success') {
    throw new Error('No Path');
  }
  return path.path;
};

module.exports = search;