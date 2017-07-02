#!/usr/bin/env node

require("babel-register")({
  ignore: function(filename) {
    if (filename.indexOf('koa') !== -1 || filename.endsWith('index.js')) {
      if (filename.endsWith('engine.js')) {
        return true;
      }
      return false;
    } else {
      return true;
    }
  },
});

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