const Graph = require('./Graph');
const search = require('./search');
const { lineString } = require('@turf/helpers');
const knn = require('rbush-knn');

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

exports.geocode = function(lat, lng, cb) {
  if (graph === null) {
    return callback();
  }
  const tree = graph.getRbushTreeIndex();
  const points = knn(tree, lat, lng, 1);
  if (!points || !points[0]) {
    return cb(new Error('location not found'));
  }
  cb(null, points[0]);
}
