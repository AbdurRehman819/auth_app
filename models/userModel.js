const mongoose= require('mongoose');
const bcrypt = require('bcrypt');

const userSchema=new mongoose.Schema({
    name: {
        type:String,
        required: true,
    },
    email:{
        type:String,
        required:true,
        unique: true,
    },
    password:{
        type:String,
        required:true
    },
    profilePicture: {
        contentType:String,
        data:String
    },
    role:{
        type:String,
        enum:['user', 'admin'],
        default: 'user'
    },
    emailVerified: {
        type:Boolean,
        default: false
    },
    verificationToken: {
        type:String,
        
    },//
   
    passwordResetToken: String,
    
    passwordResetExpires: Date,
}
  
  );

userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


const User = mongoose.model('User', userSchema);
module.exports = User;
