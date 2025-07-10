const generateHashedToken = require('../utils/generateHashToken');
const sendEmail = require('../utils/email');
const User = require('../models/userModel');
const crypto = require('crypto');
const {generateToken, jwtAuthMiddleware} = require('../middlewares/jwt');


exports.signUp=async(req,res)=>{
    try{
        const {name,email,password,role}=req.body;

    if(await User.findOne({email}))return res.status(400).json({message: 'User already exists with this email'});

    const newUser = new User({  
      name, email, password, role,
      profilePicture: req.file
        ? {
            data: req.file.buffer.toString('base64'),
            contentType: req.file.mimetype,
          }
        : undefined,
    });

       // Generate verification token
       const {token,hashedToken}= generateHashedToken();
       // Create verification link
      const verificationLink = `https://auth-app-szvj.onrender.com/user/verifyEmail/${token}`;

       //send verification email
        await sendEmail(newUser.email,"Verfication email",
            `<div style="text-align: center; padding: 20px;">
            <a href="${verificationLink}" 
               style="display: inline-block; padding: 14px 28px; background:rgb(0, 100, 123); color: white; 
                      text-decoration: none; border-radius: 6px; font-size: 16px;">
                Click here to verify </a> </div>`
            );  

        //save the token to the user document
         newUser.verificationToken=hashedToken;

        const response=await newUser.save();
        
        return res.status(201).json({
            message: 'Signup successful, Please check your email to verify your account.',
            response
        });

    }catch(err){
        console.error(err);
        return res.status(500).json({message: 'Signup failed'});
    }
};



exports.emailVerification=async(req,res)=>{
    try{
        const emailVerificationToken= req.params.token;


         // Hash the token before DB lookup because token is stored in db as hash 
        const hashedToken = crypto.createHash('sha256').update(emailVerificationToken).digest('hex');
       
        const user=await User.findOne({verificationToken: hashedToken});
        if(!user) return res.status(404).json({message: 'Invalid verification token'});
        
        user.emailVerified=true;
        user.verificationToken=undefined; //clear the token after verification
           
        const response= await user.save();
        const token = generateToken(response);

        res.status(200).json({
            message: 'Email verified successfully, you can now login',
            token: token
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({message: 'Email verification failed'});
    }
};


exports.login=async(req,res)=>{
    try{
        const {email,password}=req.body;
        const user=await  User.findOne({email});
        if(!user || !(await user.comparePassword(password)))return res.status(401).json({message: 'Invalid email or password'});
        
        if(!user.emailVerified) return res.status(403).json({message: 'verify email before logging in'});

        const token=generateToken(user);
        return res.status(200).json({
            message: 'Login successful',
            user: user,
            token: token
        });
    }catch(err){
        console.error(err);
        return res.status(500).json({message: 'Login failed'});

    }
};



exports.forgotPassword=async(req,res)=>{
    try{
        const {email}=req.body;
        const user=await User.findOne({email});
        if(!user) return res.status(404).json({message: 'User not found with this email'});

        const {token,hashedToken}=generateHashedToken();

        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();
        const passwordResetLink = `https://auth-app-szvj.onrender.com/user/resetPassword/${token}`;
          
        await sendEmail(user.email,"Reset Password",
            `<div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
            <p style="font-size: 16px; color: #333;">You requested a password reset.</p>    
            <a href="${passwordResetLink}" style="display: inline-block; padding: 14px 28px; background: #007BFF; color: white; 
            text-decoration: none; border-radius: 6px; font-size: 16px; margin: 20px 0;">Click here to reset your password
            </a><p style="font-size: 14px; color: #888;">This link expires in 10 minutes.</p></div>`);
       
            res.status(200).json({
                message: 'Password reset link sent to your email',
            });
    }catch(err){
        console.error(err);
        return res.status(500).json({message: 'Forgot password failed'});
    }
}


exports.resetPassword=async(req,res)=>{
    try{
        const resetToken = req.params.token;
        const {newPassword, confirmPassword} = req.body;
        if(newPassword !== confirmPassword) {
            return res.status(400).json({message: 'Passwords do not match'});
        }
        
        hashToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user= await User.findOne({
            passwordResetToken: hashToken,
            passwordResetExpires: { $gt: Date.now() } 
        });

        if(!user) return res.status(404).json({message: 'Invalid or expired password reset token'});

        user.password = newPassword;
        user.passwordResetToken = undefined; 
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({
            message: 'Password reset successful, you can now login with your new password'
        });

    }catch(err){
        console.error(err);
        return res.status(500).json({message: 'Reset password failed'});
    }
}