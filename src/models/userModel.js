import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, "Please provide a username"], 
  },
  email: { 
    type: String, 
    required: [true, "Please provide an email"], 
  },
  password: { 
    type: String, 
    required: [true, "Please provide a password"]
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  appID: {
    type: String, 
    ref: "App", 
    required: true 
  },
  emailVerifyToken: String,
  emailVerifyTokenExpire: Date,
});

// Compound unique index for (username, appID, email)
UserSchema.index({ appID: 1, email: 1 }, { unique: true });
UserSchema.index({ appID: 1, username: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
