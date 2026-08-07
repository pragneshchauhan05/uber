const userModel = require("../models/user.model");

module.exports.createUser = async ({ email, fullname, password }) => {
  if (!email || !fullname || !fullname.firstname || !password) {
    throw new Error("Email, fullname, and password are required");
  }
  const user = await userModel.create({
    email,
    fullname: {
      firstname: fullname.firstname,
      lastname: fullname.lastname,
    },
    password,
  });
  return user;
};
