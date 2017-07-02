const isRoad = (tags) => {
  return tags.some(tag => {
    if (tag.$.k === 'highway') {
      return true;
    }
    return false;
  });
};

module.exports = isRoad;