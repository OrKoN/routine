const fs = require('fs');
const mmap = require('mmap.js');

module.exports = function(file) {
  const fd = fs.openSync(file, 'r+');
  const stats = fs.statSync(file);
  const fileBuf = mmap.alloc(
    stats.size,
    mmap.PROT_READ,
    mmap.MAP_SHARED,
    fd,
    0);
  fs.closeSync(fd);
  return fileBuf;
}