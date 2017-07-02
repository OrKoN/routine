const filename = process.argv[2];
const { createGraph } = require('../src/osm');
console.log(filename);
createGraph(filename);