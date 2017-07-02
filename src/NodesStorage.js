const _ = require('lodash');
const K = 10000000;
const INIT_SIZE = 10000;
const SIZE_PER_ELEMENT = 28;
const resizeBuffer = require('./resizeBuffer');
const saveBuffer = require('./saveBuffer');
const loadBufferReadonly = require('./loadBufferReadonly');

class NodesStorage {
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

  set(i, data) {
    if (this.readonly) {
      throw new Error('The buffer is readonly');
    }
    this.currentSize = _.max([this.currentSize, i]) + 1;
    this.buffer = resizeBuffer(this.buffer, this.currentSize * SIZE_PER_ELEMENT);
    const id = _.padStart(data.id, 16, ' ');
    this.buffer.write(id, i * SIZE_PER_ELEMENT + 0);
    this.buffer.writeInt32BE(Math.round(Number(data.location[0]) * K), i * SIZE_PER_ELEMENT + 16);
    this.buffer.writeInt32BE(Math.round(Number(data.location[1]) * K), i * SIZE_PER_ELEMENT + 20);
    this.buffer.writeInt32BE(data.firstEdgeId, i * SIZE_PER_ELEMENT + 24);
  }

  get(i) {
    const id = this
      .buffer
      .slice(i * SIZE_PER_ELEMENT, i * SIZE_PER_ELEMENT + 16)
      .toString('utf-8')
      .trim();
    const longitude = this.buffer.readInt32BE(i * SIZE_PER_ELEMENT + 16) / K;
    const latitude = this.buffer.readInt32BE(i * SIZE_PER_ELEMENT + 20) / K;
    const firstEdgeId = this.buffer.readInt32BE(i * SIZE_PER_ELEMENT + 24);
    return {
      id,
      location: [longitude, latitude],
      firstEdgeId: firstEdgeId,
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

module.exports = NodesStorage;