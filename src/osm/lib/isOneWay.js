const isOneWay = (tags) => {
  return tags.some(tag => {
    if (tag.$.k === 'oneway' && tag.$.v === 'yes') {
      return true;
    }
    return false;
  });
}

module.exports = isOneWay;