module.exports = function(buf, currentSize) {
  const size = buf.length;
  if (currentSize / size > 0.9) {
    const newBuf = Buffer.alloc(size);
    return Buffer.concat([buf, newBuf], size * 2);
  }
  return buf;
};

