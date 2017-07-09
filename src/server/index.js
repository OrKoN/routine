const serve = require('koa-static');
const Koa = require('koa');
const Router = require('koa-router');
const mount = require('koa-mount');

const ui = new Koa();
ui.use(serve(__dirname + '/ui'));

const app = new Koa();
const router = new Router();
const cli = require('cli');
const engine = require('../engine');

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
    const origin = await geocode(ctx.query.origin);
    const destination = await geocode(ctx.query.destination); 
    const result = await getDirections(origin.id, destination.id);
    ctx.body = JSON.stringify(result);
  } catch (err) {
    ctx.status = 500;
    ctx.body = {
      message: err.message,
      stack: err.stack,
    };
  }
});

router.get('/geocode', async (ctx, next) => {
  try {
    const result = await geocode(ctx.query.location);
    ctx.body = JSON.stringify(result);
  } catch (err) {
    ctx.status = 500;
    ctx.body = {
      message: err.message,
      stack: err.stack,
    };
  }
});

app
  .use(router.routes())
  .use(router.allowedMethods());

exports.start = async function(input) {
  await engine.start(input);
  cli.ok('graph is loaded');
  return new Promise((resolve, reject) => {
    app.listen(3000, (err) => {
      if (err) {
        return reject(err);
      }
      resolve('Server started');
    });
  });
}

