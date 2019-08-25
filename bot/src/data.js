const fs = require('fs');

const DATA_PATH = '../data';

const saveJsonObject = (content, filePath) => {
  const contentString = JSON.stringify(content);
  fs.writeFileSync(filePath, contentString);
};

const loadJsonObject = (filePath) => {
  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileBuffer);
  }
  return false;
};

const saveUserState = (userState, userId, charId) => {
  saveJsonObject(userState, `${DATA_PATH}/${userId}-${charId}-state.json`);
};

const loadUserState = (userId, chatId) => loadJsonObject(`${DATA_PATH}/${userId}-${chatId}-state.json`);

const getTagList = () => loadJsonObject(`${DATA_PATH}/tags.json`);

const saveTagList = (tagList) => {
  saveJsonObject(tagList, `${DATA_PATH}/tags.json`);
};

module.exports = {
  saveUserState,
  loadUserState,
  getTagList,
  saveTagList,
};
