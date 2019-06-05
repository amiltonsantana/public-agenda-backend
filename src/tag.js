const data = require('./data')

const getList = () => {
	return data.getTagList()
}

const updateTagList = (newTagList) => {

	let tagList = getList()

	tagList.push(...newTagList)

	return data.saveTagList([...new Set(tagList)])
}

module.exports = {
	getList,
	updateTagList
}
