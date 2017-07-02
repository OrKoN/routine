const isRoad = require('./isRoad');

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

module.exports = getRoadNodes;