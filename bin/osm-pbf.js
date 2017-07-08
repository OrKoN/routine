#!/usr/bin/env node

const cli = require('cli');
const createGraph = require('../src/osm-pbf');

const { input, output } = cli.parse({
  input: [ 'i', 'an OSM XML file to process', 'file', false ],
  output: [ 'o', 'directory to save the file to', 'directory', false],
});

if (!input) {
  cli.fatal('Input file is required');
}

if (!output) {
  cli.fatal('Output directory is required');
}


createGraph(input, output)
  .then(() => {
    cli.ok('Graph is created');
  })
  .catch(err => {
    cli.error('Error', err);
  });