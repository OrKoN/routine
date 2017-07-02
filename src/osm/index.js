const fs = require('fs');
const { Parser } = require('xml2js');
const XmlStream = require('xml-stream');
const { padStart, isNumber } = require('lodash');
const distance = require('@turf/distance');
const Graph = require('../Graph');

const getXmlStream = (file) => {
  const stream = fs.createReadStream(file);
  const xml = new XmlStream(stream);
  return xml;
}

const isRoad = (tags) => {
  return tags.some(tag => {
    if (tag.$.k === 'highway') {
      return true;
    }
    return false;
  });
}

const isOneWay = (tags) => {
  return tags.some(tag => {
    if (tag.$.k === 'oneway' && tag.$.v === 'yes') {
      return true;
    }
    return false;
  });
}

const getRoadNodes = (xml) => {
  return new Promise((resolve, reject) => {
    const nodes = {};
    const isFirstOrLast = {};
    xml.collect('tag');
    xml.collect('nd');
    xml.on('endElement: way', item => {
      if (!item.tag) {
        return;
      }
      if (isRoad(item.tag)) {
        const length = item.nd.length;
        for (let i = 0; i < length; i++) {
          const node = item.nd[i];
          const osmId = node.$.ref;
          if (!nodes[osmId]) {
            nodes[osmId] = 0;
          }
          if (!isFirstOrLast[osmId]) {
            isFirstOrLast[osmId] = [0, 0];
          }
          if (i === 0) {
            isFirstOrLast[osmId][0] = 1;
          }
          if (i == length - 1) {
            isFirstOrLast[osmId][1] = 1;
          }
          
          nodes[osmId]++;
        }
      }
    });
    xml.on('end', () => {
      resolve({
        nodes,
        isFirstOrLast,
      });
    });
  });
};

const getNodesIndex = (g, xml, roadNodes, isFirstOrLast) => {
  return new Promise((resolve, reject) => {
    const nodesIndex = {};
    xml.collect('tag');
    xml.on('endElement: node', item => {
      const osmId = item.$.id;
      if (!isFirstOrLast[osmId]) {
        return;
      }
      const deadEnd = (isFirstOrLast[osmId][0] === 1 && isFirstOrLast[osmId][1] === 0)
        || (isFirstOrLast[osmId][0] === 0 && isFirstOrLast[osmId][1] === 1);
      if (roadNodes[osmId] > 1 || (roadNodes[osmId] === 0 && deadEnd)) {
        const node = {
          id: osmId,
          location: [Number(item.$.lat), Number(item.$.lon)],
          firstEdgeId: -1,
        };
        g.addVertex(node.id);
        g.setVertexValue(node.id, node);
        nodesIndex[node.id] = true;
      }
    });
    xml.on('end', () => {
      resolve(nodesIndex);
    });
  });
}

function saveGraph(g, xml, nodesIndex) {
  return new Promise((resolve, reject) => {
    let edges = 0;
    xml.collect('tag');
    xml.collect('nd');
    xml.on('endElement: way', item => {
      if (!item.tag) {
        return;
      }
      const oneWay = isOneWay(item.tag);
      if (isRoad(item.tag)) {
        let towerA = null;
        let towerB = null;
        for (let i = 0; i < item.nd.length; i++) {
          const node = item.nd[i];
          const id = node.$.ref;
          if (nodesIndex[id]) { // if a tower or dead end
            towerA = towerB;
            towerB = id;
            if (towerA && towerB) {
              // distance
              const from = {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: g.getVertexValue(towerA).location,
                }
              };
              const to = {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: g.getVertexValue(towerB).location,
                }
              };

              const units = 'meters';
              const cost = distance(from, to, units);
              g.addEdge(towerA, towerB);
              if (!oneWay) {
                g.addEdge(towerB, towerA);
              }
            }
          }
        }
      }
    });
    xml.on('end', () => {
      g.save('./test-graph');
      resolve();
    });
  });
}

exports.createGraph = function(filename) {
  const g = new Graph();
  return getRoadNodes(getXmlStream(filename))
    .then(({ nodes, isFirstOrLast }) => {
      return getNodesIndex(g, getXmlStream(filename), nodes, isFirstOrLast);
    })
    .then((nodesIndex) => {
      return saveGraph(g, getXmlStream(filename), nodesIndex);
    })
    .then(() => g)
    .catch(error => console.error(error));
}