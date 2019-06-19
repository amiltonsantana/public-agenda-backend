const data = require('./data');

const getList = () => data.getTagList();

const updateTagList = (newTagList) => {
  const tagList = getList();

  tagList.push(...newTagList);

  return data.saveTagList([...new Set(tagList)]);
};

module.exports = {
  getList,
  updateTagList,
};
