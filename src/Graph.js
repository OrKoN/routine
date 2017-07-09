const NodesStorage = require('./NodesStorage');
const EdgesStorage = require('./EdgesStorage');
const fs = require('fs');
const path = require('path');
const rbush = require('rbush');
const cli = require('cli');

/**
 x, y - external ids
 i, j - internal ids
*/
class Graph {
  constructor() {
    this.nodeIndex = {};
    this.edgeIndex = {};
    this.rbushTree = rbush(9, ['.latitude', '.longitude', '.latitude', '.longitude']); 
    this.nextNodeId = 0;
    this.nextEdgeId = 0;
    this.nodes = new NodesStorage();
    this.edges = new EdgesStorage();
  }

  addVertex(x) {
    if (x in this.nodeIndex) {
      return this.nodeIndex[x];
    }
    const xId = this.nextNodeId;
    this.nodeIndex[x] = xId;
    this.nextNodeId++;
    return xId;
  }

  getVertexNumber(x) {
    if (x in this.nodeIndex) {
      return this.nodeIndex[x];
    }
    throw new Error(`Node ${x} does not exist`);
  }

  getVertexValue(x) {
    const i = this.getVertexNumber(x);
    return this.nodes.get(i);
  }

  setVertexValue(x, v) {
    const i = this.getVertexNumber(x);
    this.nodes.set(i, v);
    this.rbushTree.insert({
      id: v.id,
      latitude: v.location[1],
      longitude: v.location[0],
    });
  }

  getEdgeNumber(x, y) {
    const key = `${x}_${y}`;
    if (key in this.edgeIndex) {
      return this.edgeIndex[key];
    }
    throw new Error(`Edge ${x}, ${y} does not exist`);
  }

  addEdge(x, y, distance) {
    const key = `${x}_${y}`;
    if (key in this.edgeIndex) {
      return this.edgeIndex[key];
    }
    const i = this.getVertexNumber(x);
    const j = this.getVertexNumber(y);
    const xValue = this.getVertexValue(x);
    const yValue = this.getVertexValue(y);
    const edgeId = this.nextEdgeId;
    this.edgeIndex[key] = edgeId;
    // if (i < j) {
    this.edges.set(edgeId, {
      i, j, nextI: -1, nextJ: -1, distance,
    });
    // } else {
    //   this.edges.set(edgeId, {
    //     i: j, j: i, nextI: -1, nextJ: -1,
    //   });
    // }

    if (xValue.firstEdgeId === -1) {
      xValue.firstEdgeId = edgeId;
      this.setVertexValue(x, xValue);
    } else {
      // connect linked list
      let targetEdgeId = xValue.firstEdgeId;
      let lastEdgeId = targetEdgeId;
      let targetEdge = this.edges.get(targetEdgeId);
      let attr = '';
      let count = 0;
      while (targetEdgeId !== -1) {
        targetEdge = this.edges.get(targetEdgeId);
        lastEdgeId = targetEdgeId;
        if (targetEdge.i === i) {
          targetEdgeId = targetEdge.nextI;
          attr = 'nextI';
        } else if (targetEdge.j == i) {
          targetEdgeId = targetEdge.nextJ;
          attr = 'nextJ';
        } else {
          throw new Error('wrong structure');
        }
        count++;
        if (count > 100) {
          throw new Error(`Infinite loop ${x} ${y}: ${targetEdgeId}, ${targetEdge.nextI}, ${targetEdge.nextJ}`);
        }
      }
      targetEdge[attr] = edgeId;
      this.edges.set(lastEdgeId, targetEdge);
    }

    if (yValue.firstEdgeId === -1) {
      yValue.firstEdgeId = edgeId;
      this.setVertexValue(y, yValue);
    } else {
      let targetEdgeId = yValue.firstEdgeId;
      let lastEdgeId = targetEdgeId;
      let targetEdge = this.edges.get(targetEdgeId);
      let attr = '';
      let count = 0;
      while (targetEdgeId !== -1) {
        targetEdge = this.edges.get(targetEdgeId);
        lastEdgeId = targetEdgeId;
        if (targetEdge.i === j) {
          targetEdgeId = targetEdge.nextI;
          attr = 'nextI';
        } else if (targetEdge.j == j) {
          targetEdgeId = targetEdge.nextJ;
          attr = 'nextJ';
        } else {
          throw new Error('wrong structure');
        }
        count++;
        if (count > 100) {
          throw new Error(`Infinite loop ${x} ${y}: ${targetEdgeId}, ${targetEdge.nextI}, ${targetEdge.nextJ}`);
        }
      }
      targetEdge[attr] = edgeId;
      this.edges.set(lastEdgeId, targetEdge);
    }
    
    this.nextEdgeId++;

    return edgeId;
  }

  getEdgeValue(x, y) {
    const edgeId = this.getEdgeNumber(x, y);
    return this.edges.get(edgeId);
  }

  setEdgeValue(x, y, v) {
    const edgeId = this.getEdgeNumber(x, y);
    this.edges.get(edgeId, v);
  }

  adjacent(x, y) {
    const i = this.getVertexNumber(x);
    const j = this.getVertexNumber(y);
    const xValue = this.getVertexValue(x);
    let targetEdgeId = xValue.firstEdgeId;
    while (targetEdgeId !== -1) {
      let targetEdge = this.edges.get(targetEdgeId);
      if (targetEdge.i === i) {
        targetEdgeId = targetEdge.nextI;
        if (targetEdge.j === j) {
          return true;
        }
      } 
      else if (targetEdge.j === i) {
        targetEdgeId = targetEdge.nextJ;
        // TODO
        // if (targetEdge.i == j) {
        //   return true;
        // }
      } else {
        throw new Error('wrong structure');
      }
    }
    return false;
  }

  neighbors(x) {
    const i = this.getVertexNumber(x);
    const xValue = this.getVertexValue(x);
    const neighbors = [];
    let targetEdgeId = xValue.firstEdgeId;
    while (targetEdgeId !== -1) {
      let targetEdge = this.edges.get(targetEdgeId);
      if (targetEdge.i === i) {
        targetEdgeId = targetEdge.nextI;
        neighbors.push(targetEdge.j);
      } else if (targetEdge.j === i) {
        targetEdgeId = targetEdge.nextJ;
        // neighbors.push(targetEdge.i);
      } else {
        throw new Error('wrong structure');
      }
    }
    return neighbors.map(internalId => {
      return this.nodes.get(internalId).id;
    });
  }

  save(destDir) {
    try {
      fs.mkdirSync(destDir);
    } catch (err) {}

    try {
      this.nodes.save(path.join(destDir, 'nodes.bin'));
      this.edges.save(path.join(destDir, 'edges.bin'));
    } catch (err) {
      cli.error(err);
      throw err;
    }
  }

  load(srcDir) {
    try {
      cli.info('Started loading nodes');
      this.nodes.load(path.join(srcDir, 'nodes.bin'));
      cli.ok('Nodes loaded');
      cli.info('Started loading edged');
      this.edges.load(path.join(srcDir, 'edges.bin'));
      cli.ok('Edges loaded');
      this.reindex();
    } catch (err) {
      cli.error(err);
      throw err;
    }
  }

  reindex() {
    cli.info('Started building node index');
    this.buildNodeIndex();
    cli.info('Node index built');
    cli.info('Started building edges index');
    this.buildEdgeIndex();
    cli.ok('Edges index built');
  }

  buildNodeIndex() {
    this.nodeIndex = {};
    this.rbushTree.clear();
    
    const length = this.nodes.getNumberOfElements();
    for (let i = 0; i < length; i++) {
      const node = this.nodes.get(i);
      this.nodeIndex[node.id] = i;
      this.rbushTree.insert({
        id: node.id,
        latitude: node.location[1],
        longitude: node.location[0],
      });
    }
  }

  buildEdgeIndex() {
    this.edgeIndex = {};
    const length = this.edges.getNumberOfElements();
    for (let k = 0; k < length; k++) {
      const { i, j } = this.edges.get(k);
      const x = this.nodes.get(i);
      const y = this.nodes.get(j);
      const key = `${x.id}_${y.id}`;
      this.edgeIndex[key] = i;
    }
  }

  getRbushTreeIndex() {
    return this.rbushTree;
  }

  getSize() {
    return this.edges.getSize() + this.nodes.getSize();
  }
}

module.exports = Graph;