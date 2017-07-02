const Graph = require('./Graph');
const search = require('./search');
const { lineString } = require('@turf/helpers');

let graph = null;

exports.init = function(input, callback) {
  graph = new Graph();
  graph.load(input);
  callback();
}

exports.directions = function (startId, endId, callback) {
  if (graph === null) {
    return callback();
  }
  try {
    const result = search(graph, startId, endId);
    const polyline = lineString(result.map(node => {
      const nodeValue = graph.getVertexValue(node);
      return nodeValue.location;
    }));
    callback(null, polyline);
  } catch (err) {
    callback(err);
  }
}
