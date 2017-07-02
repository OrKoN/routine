const Graph = require('../Graph');
const getXmlStream = require('./lib/getXmlStream');
const isRoad = require('./lib/isRoad');
const isOneWay = require('./lib/isOneWay');
const getRoadNodes = require('./lib/getRoadNodes');
const buildNodeIndex = require('./lib/buildNodeIndex');
const saveGraph = require('./lib/saveGraph');

exports.createGraph = async function(filename, dir) {
  const g = new Graph();
  const { nodes, isFirstOrLast } = await getRoadNodes(getXmlStream(filename));
  const nodeIndex = await buildNodeIndex(g, getXmlStream(filename), nodes, isFirstOrLast);
  await saveGraph(g, getXmlStream(filename), nodeIndex, dir);
  return g;
}