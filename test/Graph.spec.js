const Graph = require('../src/Graph');
const assert = require('assert');
const _ = require('lodash');

describe('Graph', () => {
  it('should build a graph', () => {
    const data = _.range(8).map(i => {
      return {
        id: `node${i}`,
        location: [9, 48],
        firstEdgeId: -1,
      }
    })
    const g = new Graph();
    data.forEach(node => {
      g.addVertex(node.id);
      g.setVertexValue(node.id, node);
    });

    assert.deepEqual(g.getVertexValue('node1'), data[1]);

    g.addEdge('node0', 'node3');
    g.addEdge('node1', 'node3');
    g.addEdge('node0', 'node7');
    g.addEdge('node3', 'node5');
    g.addEdge('node3', 'node7');
    g.addEdge('node1', 'node2');

    console.log('    Nodes');
    for (var i = 0; i < 8; i++) {
      console.log('\t#%d id=%s lng=%d lat=%d edge#%d',
        i,
        g.nodes.get(i).id,
        g.nodes.get(i).location[0],
        g.nodes.get(i).location[1],
        g.nodes.get(i).firstEdgeId
      );
    }

    let nodeId = 0;
    assert.deepEqual({
      i: 0,
      id: g.nodes.get(nodeId).id,
      lng: g.nodes.get(nodeId).location[0],
      lat: g.nodes.get(nodeId).location[1],
      edge: g.nodes.get(nodeId).firstEdgeId
    }, {
      i: nodeId,
      id: data[0].id,
      lng: 9,
      lat: 48,
      edge: 0,
    });

    console.log('    Edges');
    for (var i = 0; i < 6; i++) {
      console.log('\t#%d A=%d B=%d nextA=%d nextB=%d',
        i,
        g.edges.get(i).i,
        g.edges.get(i).j,
        g.edges.get(i).nextI,
        g.edges.get(i).nextJ
      );
    }

    assert.equal(g.adjacent('node0', 'node3'), true);
    assert.equal(g.adjacent('node0', 'node1'), false);
    assert.equal(g.adjacent('node1', 'node2'), true);
    assert.equal(g.adjacent('node3', 'node6'), false);

    assert.deepEqual(g.neighbors('node0'), ['node3', 'node7']);
  });
});