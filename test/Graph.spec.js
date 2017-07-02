const Graph = require('../src/Graph');
const assert = require('assert');

describe('Graph', () => {
  it('should build a graph', () => {
    const data0 = {
      id: '00',
      location: [9, 48],
      firstEdgeId: -1,
    };
    const data1 = {
      id: '01',
      location: [9, 48],
      firstEdgeId: -1,
    };
    const data2 = {
      id: '02',
      location: [9, 48],
      firstEdgeId: -1,
    };
    const data3 = {
      id: '03',
      location: [9, 48],
      firstEdgeId: -1,
    };
    const data4 = {
      id: '04',
      location: [9, 48],
      firstEdgeId: -1,
    };
    const data5 = {
      id: '05',
      location: [9, 48],
      firstEdgeId: -1,
    };
    const data6 = {
      id: '06',
      location: [9, 48],
      firstEdgeId: -1,
    };
    const data7 = {
      id: '07',
      location: [9, 48],
      firstEdgeId: -1,
    };

    const g = new Graph();
    g.addVertex('node0');
    g.addVertex('node1');
    g.addVertex('node2');
    g.addVertex('node3');
    g.addVertex('node4');
    g.addVertex('node5');
    g.addVertex('node6');
    g.addVertex('node7');
    g.setVertexValue('node0', data0);
    g.setVertexValue('node1', data1);
    g.setVertexValue('node2', data2);
    g.setVertexValue('node3', data3);
    g.setVertexValue('node4', data4);
    g.setVertexValue('node5', data5);
    g.setVertexValue('node6', data6);
    g.setVertexValue('node7', data7);

    assert.deepEqual(g.getVertexValue('node1'), data1);

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
      id: data0.id,
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

    assert.deepEqual(g.neighbors('node0'), ['03', '07']);
  });
});