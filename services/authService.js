import Admin from "../models/Admin.js";

export const findAdminByEmail = async (email) => {
  return await Admin.findOne({ email });
};

export const createAdminUser = async (email, hashedPassword) => {
  return await Admin.create({
    email,
    password: hashedPassword,
  });
};
