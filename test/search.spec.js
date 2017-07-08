const assert = require('assert');
const createGraph = require('../src/osm-pbf');
const search = require('../src/search');
const knn = require('rbush-knn');

describe('search', () => {
  let g = null;

  before(async () => {
    g = await createGraph('./test/files/map.osm.pbf', './test-graph');
  });

  it('should find path on the graph', async () => {
    // http://www.openstreetmap.org/node/83683981#map=18/48.78411/9.21148
    // http://www.openstreetmap.org/node/83684087#map=18/48.78411/9.21148
    // http://www.openstreetmap.org/node/83684467#map=18/48.78411/9.21148
    assert.deepEqual(search(g, '83683981', '83684467'), [
      '83683981',
      '81785070',
      '83684467',
    ]);
    assert.deepEqual(search(g, '83683981', '82658025'), [
      '83683981',
      '81785070',
      '2853280950',
      '316961593',
      '82658025',
    ]);
  });

  it('should geocode', () => {
    const tree = g.getRbushTreeIndex();
    const points = knn(tree, 48.7836592, 9.2107229, 1);
    assert.equal(points[0].id, '83683981');
  });
});