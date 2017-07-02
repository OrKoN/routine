const assert = require('assert');
const { createGraph } = require('../src/osm');
const search = require('../src/search');

describe('search', () => {
  it('should find path on the graph', () => {
    return createGraph('./test/files/map.osm', './test-graph')
      .then(g => {
        // http://www.openstreetmap.org/node/83683981#map=18/48.78411/9.21148
        // http://www.openstreetmap.org/node/83684087#map=18/48.78411/9.21148
        // http://www.openstreetmap.org/node/83684467#map=18/48.78411/9.21148
        assert.deepEqual(search(g, '83683981', '83684467'), [
          '83683981',
          '83684087',
          '83684467',
        ]);
        assert.deepEqual(search(g, '83683981', '1373588955'), [
          '83683981',
          '81785070',
          '2853280950',
          '316961604',
          '316961593',
          '82658025',
          '1373588955',
        ]);
      });
  });
});