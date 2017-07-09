const resizeBuffer = require('./resizeBuffer');
const INIT_SIZE = 100000000;
const SIZE_PER_ELEMENT = 20;
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

  set(edgeId, { i, j, nextI, nextJ, distance }) {
    if (this.readonly) {
      throw new Error('The buffer is readonly');
    }
    this.currentSize = _.max([this.currentSize, i, j]) + 1;
    this.buffer = resizeBuffer(this.buffer, this.currentSize * SIZE_PER_ELEMENT);
    this.buffer.writeInt32BE(i, edgeId * SIZE_PER_ELEMENT + 0);
    this.buffer.writeInt32BE(j, edgeId * SIZE_PER_ELEMENT + 4);
    this.buffer.writeInt32BE(nextI, edgeId * SIZE_PER_ELEMENT + 8);
    this.buffer.writeInt32BE(nextJ, edgeId * SIZE_PER_ELEMENT + 12);
    this.buffer.writeInt32BE(distance, edgeId * SIZE_PER_ELEMENT + 16);
  }

  get(edgeId) {
    const i = this.buffer.readInt32BE(edgeId * SIZE_PER_ELEMENT  + 0);
    const j = this.buffer.readInt32BE(edgeId * SIZE_PER_ELEMENT  + 4);
    const nextI = this.buffer.readInt32BE(edgeId * SIZE_PER_ELEMENT  + 8);
    const nextJ = this.buffer.readInt32BE(edgeId * SIZE_PER_ELEMENT  + 12);
    const distance = this.buffer.readInt32BE(edgeId * SIZE_PER_ELEMENT  + 16);
    return {
      i,
      j,
      nextI,
      nextJ,
      distance,
    };
  }

  save(destFile) {
    saveBuffer(destFile, this.buffer, this.currentSize * SIZE_PER_ELEMENT);
  }

  load(srcFile) {
    this.buffer = loadBufferReadonly(srcFile);
    this.readonly = true;
    this.currentSize = this.buffer.length / SIZE_PER_ELEMENT;
  }

  getNumberOfElements() {
    return this.currentSize;
  }

  getSize() {
    return this.getNumberOfElements() * SIZE_PER_ELEMENT;
  }
}

module.exports = EdgesStorage;