const Graph = require('./Graph');
const search = require('./search');
const { lineString } = require('@turf/helpers');
const knn = require('rbush-knn');
const workers = {};
const childProcess = require('child_process');
const numberOfWorkers = require('os').cpus().length - 1;
const callbacks = {};
const uuid = require('uuid');
const EventEmitter = require('events');
const internal = new EventEmitter();

function emitReady() {
  const ready = Object.keys(workers).map(id => {
    return workers[id];
  }).every(child => child.state === 'ready');
  if (ready) {
    internal.emit('ready');
  }
}

function makeMessageHandler(id) {
  return  (m) => {
    switch (m.event) {
      case 'ready':
        workers[id].state = 'ready';
        emitReady();
        break;
      case 'geocode-response':
        {
          const { eventId, response } = m;
          const cb = callbacks[eventId];
          delete callbacks[eventId];
          cb(null, response);
        }
        break;
      case 'directions-response':
        {
          const { eventId, response } = m;
          const cb = callbacks[eventId];
          delete callbacks[eventId];
          cb(null, response);
        }
        break;
    }
  };
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function pickChild() {
  const options = Object.keys(workers).map(id => {
    return workers[id];
  }).filter(child => child.state === 'ready');
  const random = getRandomInt(0, options.length);
  return workers[random];
}

exports.start = function(input) {
  console.log(`Starting ${numberOfWorkers} workers`);
  for (let i = 0; i < numberOfWorkers; i++) {
    const child = childProcess.fork('./src/worker.js', [input]);
    workers[i] = {
      child,
      state: 'starting',
    };
    child.on('message', makeMessageHandler(i));
  }
  return new Promise((resolve, reject) => {
    internal.once('ready', resolve);
  });
}

exports.geocode = function(lat, lng, cb) {
  const id = uuid.v4();
  const worker = pickChild();
  callbacks[id] = cb;
  worker.child.send({
    event: 'geocode-request',
    eventId: id,
    request: {
      lat,
      lng,
    }
  });
}

exports.directions = function(startId, endId, cb) {
  const id = uuid.v4();
  const worker = pickChild();
  callbacks[id] = cb;
  worker.child.send({
    event: 'directions-request',
    eventId: id,
    request: {
      startId,
      endId,
    }
  });
}