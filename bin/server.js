#!/usr/bin/env node

const cli = require('cli');

const { input } = cli.parse({
  input: [ 'i', 'directory which contains the graph in binary', 'directory', false ],
});

if (!input) {
  cli.fatal('Input dir is required');
}

const { start } = require('../src/server');

start(input)
  .then(() => {
    cli.ok('Server is created');
  });