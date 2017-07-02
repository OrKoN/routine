const fs = require('fs');

module.exports = function(dest, buf) {
  fs.writeFileSync(dest, buf);
};

