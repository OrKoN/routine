const saveBuffer = require('../src/saveBuffer');
const assert = require('assert');
const fs = require('fs');

describe('saveBuffer', () => {
  afterEach(() => {
    fs.unlinkSync('./test.buffer');
  });

  it('should save a buffer', () => {
    const buf = Buffer.alloc(1);
    buf.writeUInt8(118, 0);
    saveBuffer('./test.buffer', buf);
  });
});