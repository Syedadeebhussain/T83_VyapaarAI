exports.extractMessage = (body) => {
  try {
    return body.entry[0].changes[0].value.messages[0];
  } catch (err) {
    return null;
  }
};
