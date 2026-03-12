import mongoose from 'mongoose';

const DevSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true,"Please provide a username"], 
    unique: true 
  },
  email: { 
    type: String, 
    required: [true,"Please provide an email"], 
    unique: true 
  },
  password: { 
    type: String, 
    required: [true,"Please provide a password"]
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  isDev: { 
    type: Boolean, 
    default: true 
  },
  emailVerifyToken: String,
  emailVerifyTokenExpire: Date,
  apps: [{ type: mongoose.Schema.Types.ObjectId, ref: "App" }],
});

const Dev = mongoose.models.Dev || mongoose.model("Dev", DevSchema);

export default Dev;