class EdgesStorage {
  constructor(buffer) {
    this.buffer = buffer || Buffer.alloc(10000);
  }

  set(edgeId, { i, j, nextI, nextJ }) {
    this.buffer.writeInt32BE(i, edgeId * 16 + 0);
    this.buffer.writeInt32BE(j, edgeId * 16 + 4);
    this.buffer.writeInt32BE(nextI, edgeId * 16 + 8);
    this.buffer.writeInt32BE(nextJ, edgeId * 16 + 12);
  }

  get(edgeId) {
    const i = this.buffer.readInt32BE(edgeId * 16  + 0);
    const j = this.buffer.readInt32BE(edgeId * 16  + 4);
    const nextI = this.buffer.readInt32BE(edgeId * 16  + 8);
    const nextJ = this.buffer.readInt32BE(edgeId * 16  + 12);
    return {
      i,
      j,
      nextI,
      nextJ,
    };
  }
}

module.exports = EdgesStorage;