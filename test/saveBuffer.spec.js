const saveBuffer = require('../src/saveBuffer');
const assert = require('assert');
const fs = require('fs');

describe('saveBuffer', () => {
  afterEach(() => {
    fs.unlinkSync('./test.buffer');
  });

  it('should save a buffer', () => {
    const buf = Buffer.alloc(10);
    buf.writeUInt8(118, 0);
    buf.writeUInt8(119, 1);
    saveBuffer('./test.buffer', buf, 1);
    const readBuffer = fs.readFileSync('./test.buffer');
    assert.equal(readBuffer.length, 1);
    assert.equal(readBuffer.readUInt8(0), 118);
  });
});