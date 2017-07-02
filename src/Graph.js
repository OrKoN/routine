const NodesStorage = require('./NodesStorage');
const EdgesStorage = require('./EdgesStorage');

/**
 x, y - external ids
 i, j - internal ids
*/
class Graph {
  constructor() {
    this.nodeIndex = {};
    this.edgesIndex = {};
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
  }

  getEdgeNumber(x, y) {
    const key = `${x}_${y}`;
    if (key in this.edgesIndex) {
      return this.edgesIndex[key];
    }
    throw new Error(`Edge ${x}, ${y} does not exist`);
  }

  addEdge(x, y) {
    const key = `${x}_${y}`;
    if (key in this.edgesIndex) {
      return this.edgesIndex[key];
    }
    const i = this.getVertexNumber(x);
    const j = this.getVertexNumber(y);
    const xValue = this.getVertexValue(x);
    const yValue = this.getVertexValue(y);
    const edgeId = this.nextEdgeId;
    this.edgesIndex[key] = edgeId;
    if (i < j) {
      this.edges.set(edgeId, {
        i, j, nextI: -1, nextJ: -1
      });
    } else {
      this.edges.set(edgeId, {
        i: j, j: i, nextI: -1, nextJ: -1,
      });
    }

    if (xValue.firstEdgeId === -1) {
      xValue.firstEdgeId = edgeId;
      this.setVertexValue(x, xValue);
    } else {
      // connect linked list
      let targetEdgeId = xValue.firstEdgeId;
      let lastEdgeId = targetEdgeId;
      let targetEdge = this.edges.get(targetEdgeId);
      let attr = '';
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
      } else if (targetEdge.j === i) {
        targetEdgeId = targetEdge.nextJ;
        if (targetEdge.i == j) {
          return true;
        }
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
        neighbors.push(targetEdge.i);
      } else {
        throw new Error('wrong structure');
      }
    }
    return neighbors.map(internalId => {
      return this.nodes.get(internalId).id;
    });
  }
}

module.exports = Graph;