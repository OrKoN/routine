const assert = require('assert');
const createGraph = require('../src/osm-pbf');

describe('osm-pbf', () => {
  it('should create a graph', () => {
    return createGraph('./test/files/map.osm.pbf', './test-graph')
      .then(g => {
        // http://www.openstreetmap.org/node/83684087#map=18/48.78411/9.21148
        assert.deepEqual(g.neighbors('83684087'), ['83683981', '281889346', '83684467']);
        assert.equal(g.adjacent('83684087', '281889346'), true);
        assert.equal(g.adjacent('281889346', '83684087'), true);
        assert.equal(g.adjacent('83683981', '83684467'), false);
      });
  });
});