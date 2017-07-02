const { reverse } = require('lodash');
const FastPriorityQueue = require('fastpriorityqueue');

class ExtendedFastPriorityQueue extends FastPriorityQueue {
  constructor(fn) {
    super(fn);
  }

  has(node) {
    if (this.array.find(item => item.node === node)) {
      return true;
    }
    return false;
  }

  updateIfHigher(node, cost) {
    let replaced = false;
    let myval = null;
    for (var i = 0; i < this.array.length; i++) {
      const item = this.array[i];
      if (item.node === node && item.cost > cost) {
        item.cost = cost;
        replaced = true;
        myval = item;
        break;
      }
    }
    if (replaced) {
      // reorder
      var p;
      var ap;
      while (i > 0) {
          p = (i - 1) >> 1;
          ap = this.array[p];
          if (!this.compare(myval, ap)) {
               break;
          }
          this.array[i] = ap;
          i = p;
      }
      this.array[i] = myval;
    }
    return replaced;
  }
}

const search = (graph, startId, endId) => {
  let node = startId;
  let cost = 0;
  const prev = [];

  const frontier = new ExtendedFastPriorityQueue((a, b) => {
    return a.cost < b.cost;
  });

  frontier.add({ node, cost });

  const explored = new Set();

  do {
    if (frontier.isEmpty()) {
      throw new Error('path not found');
    }
    const item = frontier.poll(); 
    node = item.node;
    if (node === endId) {
      break;
    }
    explored.add(node);
    const neighbors = graph.neighbors(node);
    for (let i = 0; i < neighbors.length; i++) {
      const inFrontier = frontier.has(neighbors[i]);
      if (!explored.has(neighbors[i]) && !inFrontier) {
        frontier.add({ node: neighbors[i], cost: cost + 1 });
        prev[neighbors[i]] = node;
      } else if (inFrontier) {
        if (frontier.updateIfHigher(neighbors[i], cost + 1)) {
          prev[neighbors[i]] = node;
        }
      }
    }
  } while (true);

  const result = [];
  let target = endId;
  while (prev[target] !== undefined) {
    result.push(target);
    target = prev[target];
  }
  if (result.length === 0) {
    throw new Error('No path');
  }
  result.push(target);
  return reverse(result)
}

module.exports = search;