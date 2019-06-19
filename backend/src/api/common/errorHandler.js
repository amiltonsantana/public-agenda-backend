const handleError = (err) => {
  const errors = {
    code: 500,
    message: err,
  };

  return { errors };
};

module.exports = handleError;
