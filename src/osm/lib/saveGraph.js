const distance = require('@turf/distance');
const isOneWay = require('./isOneWay');
const isRoad = require('./isRoad');

function saveGraph(g, xml, nodesIndex, dir) {
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
      g.save(dir);
      resolve();
    });
  });
}

module.exports = saveGraph;