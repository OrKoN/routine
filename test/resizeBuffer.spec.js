const assert = require('assert');
const resizeBuffer = require('../src/resizeBuffer');

describe('resizeBuffer', () => {
  it('should resize', () => {
    const buf = Buffer.alloc(10);
    buf.writeUInt8(112, 6);
    const newBuf = resizeBuffer(buf, 10);
    assert.equal(newBuf.length, 20);
    assert.equal(newBuf.readUInt8(6), 112);
  });
});