const serve = require('koa-static');
const Koa = require('koa');
const Router = require('koa-router');
const mount = require('koa-mount');

const ui = new Koa();
ui.use(serve(__dirname + '/ui'));

const app = new Koa();
const router = new Router();

const Graph = require('../Graph');
const graph = new Graph();

const workerFarm = require('worker-farm');
const engine = workerFarm({
  maxConcurrentWorkers: 1,
  autoStart: true,
}, require.resolve('../engine'), [ 'directions', 'init']);

app.use(mount('/ui', ui));

function getDirections(startId, endId) {
  return new Promise((resolve, reject) => {
    engine.directions(startId, endId, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}

function geocode(location) {
  return new Promise((resolve, reject) => {
    const spl = location.split(',');
    const lat = spl.pop();
    const lon = spl.pop();
    engine.geocode(lat, lon, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}

router.get('/directions', async (ctx, next) => {
  try {
    console.log(ctx.query);
    const originId = '83683981';
    const destinationId = '1373588955';
    // const originId = await geocode(ctx.query.origin);
    // const destinationId = await geocode(ctx.query.destination); 
    console.log(originId, destinationId);
    const result = await getDirections(originId, destinationId);
    ctx.body = JSON.stringify(result);
  } catch (err) {
    ctx.status = 500;
    ctx.body = err;
  }
});

app
  .use(router.routes())
  .use(router.allowedMethods());

exports.start = function(input) {
  graph.load(input);
  engine.init(input, () => {
    console.log('cb');
  });
  return new Promise((resolve, reject) => {
    app.listen(3000, (err) => {
      if (err) {
        return reject(err);
      }
      resolve('Server started');
    });
  });
}

