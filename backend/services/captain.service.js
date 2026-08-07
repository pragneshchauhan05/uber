const captainModel = require("../models/captain.model");

module.exports.createCaptain = async (
  firstName,
  lastName,
  email,
  password,
  vehicleType,
  color,
  plate,
  capacity,
) => {
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !vehicleType ||
    !color ||
    !plate ||
    !capacity
  ) {
    throw new Error("All fields are required");
  }
  const captain = new captainModel({
    fullname: {
      firstname: firstName,
      lastname: lastName,
    },
    email: email,
    password: password,
    vehicle: {
      vehicleType: vehicleType,
      color: color,
      plate: plate,
      capacity: capacity,
    },
  });
  return await captain.save();
};
