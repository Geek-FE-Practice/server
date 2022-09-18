import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema({
  __v: {
    type: Number,
    select: false,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
});

const User = model("User", userSchema);

export default User;
