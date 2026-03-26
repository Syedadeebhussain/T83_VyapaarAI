exports.validateRegister = ({ email, password }) => {
  if (!email || !password) {
    return "Email and password required";
  }
  return null;
};
