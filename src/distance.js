const distance = require('@turf/distance');

module.exports = function(a, b) {
  const from = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: a.location,
    }
  };
  const to = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: b.location,
    }
  };

  const units = 'meters';
  return distance(from, to, units);
}