const listEventsTags = (events) => {
  const allTags = [];

  events.forEach((event) => {
    allTags.push(...event.tags);
  });

  const uniqueTags = [...new Set(allTags)];

  return uniqueTags;
};

module.exports = {
  listEventsTags,
};
