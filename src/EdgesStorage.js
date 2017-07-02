const resizeBuffer = require('./resizeBuffer');
const INIT_SIZE = 10000;
const SIZE_PER_ELEMENT = 16;
const _ = require('lodash');
const saveBuffer = require('./saveBuffer');
const loadBufferReadonly = require('./loadBufferReadonly');

class EdgesStorage {
  constructor(buffer) {
    this.size = 0;
    this.readonly = false;
    if (buffer) {
      this.readonly = true;
      this.buffer = buffer;
    } else {
      this.buffer = Buffer.alloc(INIT_SIZE);
    }
  }

  set(edgeId, { i, j, nextI, nextJ }) {
    if (this.readonly) {
      throw new Error('The buffer is readonly');
    }
    this.currentSize = _.max([this.currentSize, i, j]) + 1;
    this.buffer = resizeBuffer(this.buffer, this.currentSize * SIZE_PER_ELEMENT);
    this.buffer.writeInt32BE(i, edgeId * SIZE_PER_ELEMENT + 0);
    this.buffer.writeInt32BE(j, edgeId * SIZE_PER_ELEMENT + 4);
    this.buffer.writeInt32BE(nextI, edgeId * SIZE_PER_ELEMENT + 8);
    this.buffer.writeInt32BE(nextJ, edgeId * SIZE_PER_ELEMENT + 12);
  }

  get(edgeId) {
    const i = this.buffer.readInt32BE(edgeId * SIZE_PER_ELEMENT  + 0);
    const j = this.buffer.readInt32BE(edgeId * SIZE_PER_ELEMENT  + 4);
    const nextI = this.buffer.readInt32BE(edgeId * SIZE_PER_ELEMENT  + 8);
    const nextJ = this.buffer.readInt32BE(edgeId * SIZE_PER_ELEMENT  + 12);
    return {
      i,
      j,
      nextI,
      nextJ,
    };
  }

  save(destFile) {
    saveBuffer(destFile, this.buffer);
  }

  load(srcFile) {
    this.buffer = loadBufferReadonly(srcFile);
    this.readonly = true;
  }
}

module.exports = EdgesStorage;