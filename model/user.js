const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: { 
    type: String, 
    require: true 
  },
  dob: {
    type: String, 
    require: true
  },
  email: {
    type: String, 
    unique: true 
  },
  password: {
    type: String,
    require: true
  },
  token: {
    type: String
  }
  
}, { timestamps: true});

module.exports = model("user", userSchema);
