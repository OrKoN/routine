const loadBufferReadonly = require('../src/loadBufferReadonly');
const assert = require('assert');
const fs = require('fs');

describe('loadBufferReadonly', () => {
  afterEach(() => {
    fs.unlinkSync('./test.buffer');
  });

  it('should load a buffer readonly', () => {
    const buf = Buffer.alloc(1);
    buf.writeUInt8(119, 0);
    fs.writeFileSync('./test.buffer', buf);
    const readonly = loadBufferReadonly('./test.buffer');
    assert.equal(readonly.readUInt8(0), 119);
  });
});