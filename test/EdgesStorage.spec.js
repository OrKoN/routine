const EdgesStorage = require('../src/EdgesStorage');
const assert = require('assert');

describe('EdgesStorage', () => {
  it('should store edges data', () => {
    const edges = new EdgesStorage();
    edges.set(1, { i: 5, j:6, nextI: -1, nextJ: -1 });
    assert.deepEqual(edges.get(1), { i: 5, j:6, nextI: -1, nextJ: -1 });
  });
});