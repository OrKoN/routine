const through = require('through2');
const parseOSM = require('osm-pbf-parser');
const fs = require('fs');
const Graph = require('../Graph');
const prettyBytes = require('pretty-bytes');
const cli = require('cli');
const distance = require('../distance');

const highways = [
  'motorway',
  'trunk',
  'primary',
  'secondary',
  'tertiary',
  'residential',
  'primary_link',
  'secondary_link',
  'trunk_link',
  'tertiary_link',
  'motorway_link',
  'unclassified',
  'road',
  'living_street',
]

function isRoadWay(item) {
  if (item.type === 'way') {
    if (item.tags && item.tags.hasOwnProperty('highway')) {
      const highway = item.tags.highway;
      if (highways.indexOf(highway) !== -1) {
        return true;
      }
    }
  }
  return false;
}

function collectNodesInWays(input) {
  const nodesInWays = {};
  const osm = parseOSM();
  return new Promise((resolve, reject) => {
    fs.createReadStream(input)
      .pipe(osm)
      .pipe(through.obj(function (items, enc, next) {
        items.forEach(function (item) {
          if (isRoadWay(item)) {
            for (const [index, ref] of item.refs.entries()) {
              if (!(ref in nodesInWays)) {
                nodesInWays[ref] = {
                  isLast: false,
                  isFirst: false,
                  count: 0,
                };
              }

              nodesInWays[ref].count++;
              if (index === 0) {
                nodesInWays[ref].isFirst = true;
              }
              if (index === item.refs.length - 1) {
                nodesInWays[ref].isLast = true;
              }
            }
          }
        });
        next();
      }))
      .on('finish', () => {
        resolve(nodesInWays);
      })
      .on('error', reject);
  });
}


function isTower(id, nodesInWays) {
  const nodeInWays = nodesInWays[id];
  if (nodeInWays) {
    if (nodeInWays.count > 1
        || nodeInWays.isFirst
        || nodeInWays.isLast) {
      return true;
    }
  }
  return false;
}

function buildGraph(input, output, nodesInWays) {
  let count = 0;
  const osm = parseOSM();
  const g = new Graph();
  const stats = {
    nodes: 0,
    edges: 0,
  };
  return new Promise((resolve, reject) => {
    fs.createReadStream(input)
      .pipe(osm)
      .pipe(through.obj(function (items, enc, next) {
        items.forEach(function (item) {
          if (item.type === 'node' && isTower(item.id, nodesInWays)) {
            const node = {
              id: String(item.id),
              location: [Number(item.lon), Number(item.lat)],
              firstEdgeId: -1,
            };
            stats['nodes']++;
            g.addVertex(node.id);
            g.setVertexValue(node.id, node);
          } else if (isRoadWay(item)) {
            let towerA = null
            let towerB = null;
            for (let ref of item.refs) {
              if (isTower(ref, nodesInWays)) {
                towerA = towerB;
                towerB = ref;
                if (towerA && towerB && towerA !== towerB) {
                  const d = distance(g.getVertexValue(towerA), g.getVertexValue(towerB));
                  if (towerA !== towerB) {
                    g.addEdge(towerA, towerB, d);
                    stats['edges']++;
                    if (item.tags.oneway !== 'yes') {
                      g.addEdge(towerB, towerA, d);
                      stats['edges']++;
                    }
                  }
                }
              }
            }
          }
        });
        next();
      }))
      .on('finish', () => {
        resolve();
      })
      .on('error', reject);
  })
  .then(() => {
    g.save(output);
    const { heapUsed } = process.memoryUsage();
    cli.info(`Memory used ${prettyBytes(heapUsed)}`);
    cli.info(`Graph size ${prettyBytes(g.getSize())}`);
    cli.info(`Nodes in graph ${g.nodes.getNumberOfElements()}`);
    cli.info(`Edges in graph ${g.edges.getNumberOfElements()}`);
    return g;
  });
}

module.exports = async function (input, output) {
  const nodesInWays = await collectNodesInWays(input);
  return await buildGraph(input, output, nodesInWays);
}