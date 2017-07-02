const NodesStorage = require('../src/NodesStorage');
const assert = require('assert');

describe('NodeStorage', () => {
  it('should store node data', () => {
    const nodes = new NodesStorage();
    const data = {
      id: '12345678',
      location: [9, 48],
      firstEdgeId: -1,
    };
    nodes.set(1, data);
    assert.deepEqual(nodes.get(1), data);
  });
});