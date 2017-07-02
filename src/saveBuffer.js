const fs = require('fs');

module.exports = function(dest, buf, currentSize) {
  fs.writeFileSync(dest, buf.slice(0, currentSize));
};

