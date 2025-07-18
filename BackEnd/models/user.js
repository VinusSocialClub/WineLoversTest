const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true }, // Nome visível no site
  email: { type: String, required: true, unique: true },    // Para login
  password: { type: String, required: true }
});

module.exports = model('User', UserSchema);
