const XmlStream = require('xml-stream');
const fs = require('fs');

const getXmlStream = (file) => {
  const stream = fs.createReadStream(file);
  const xml = new XmlStream(stream);
  return xml;
}

module.exports = getXmlStream;