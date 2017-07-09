const Graph = require('./Graph');
const search = require('./search');
const { lineString } = require('@turf/helpers');
const knn = require('rbush-knn');
const input = process.argv[2];
const graph = new Graph();
graph.load(input);

process.send({
  event: 'ready',
});

function directions (startId, endId) {
  const result = search(graph, startId, endId);
  const polyline = lineString(result.map(node => {
    const nodeValue = graph.getVertexValue(node);
    return nodeValue.location;
  }));
  return polyline;
}

function geocode(lat, lng) {
  const tree = graph.getRbushTreeIndex();
  const points = knn(tree, lat, lng, 1);
  if (!points || !points[0]) {
    return new Error('location not found');
  }
  return points[0];
}

process.on('message', (m) => {
  switch (m.event) {
    case 'geocode-request':
      {
        const { eventId, request } = m;
        const response = geocode(request.lat, request.lng);
        process.send({
          event: 'geocode-response',
          eventId,
          response,
        });
      }
      break;
    case 'directions-request':
      {
        const { eventId, request } = m;
        const response = directions(request.startId, request.endId);
        process.send({
          event: 'directions-response',
          eventId,
          response,
        });
      }
      break;
  }
});
