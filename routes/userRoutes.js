const router = require('express').Router();
const User = require('../models/userModel');
const upload= require('../middlewares/upload');
const isAdmin=require('../middlewares/isAdmin');
const {generateToken, jwtAuthMiddleware} = require('../middlewares/jwt');
const authController=require('../controllers/auth_controllers');


//Signup route
router.post('/signup',upload.single('profilePicture'),authController.signUp);
//Email verification route
router.get('/verifyEmail/:token',authController.emailVerification);
//Login route
router.post('/login',authController.login);
//forgot password route
router.post('/forgotPassword',authController.forgotPassword);
//reset password route
router.put('/resetPassword/:token',authController.resetPassword);


//get user profile
 router.get('/profile',jwtAuthMiddleware,async(req,res)=>{
    try{
        const userID=req.user.id;
        const user= await User.findById(userID).select('-password -__v');
        if(!user) return res.status(404).json({message: 'User not found'});
        
         res.status(200).json({
            message: 'Profile fetched successfully',
            user: user
        });
    }catch(err){
        console.error(err);
        return res.status(500).json({message: 'Profile fetch failed'});
    }
 })



//update user profile
router.put('/updatePassword', jwtAuthMiddleware,async(req,res)=>{
    try{
        const {oldPassword, newPassword} = req.body;
        const userID=req.user.id;
        const user=await User.findById(userID);
        if(!user) return res.status(404).json({message: 'User not found'});
 
        const isMatch=await user.comparePassword(oldPassword);

        if(!isMatch) return res.status(401).json({message: 'Old password is incorrect'});
        user.password=newPassword;
        user.save();
        return res.status(200).json({message: 'Password updated successfully'});
        

    }catch(err){
        console.error(err);
        return res.status(500).json({message: 'Password update failed'});
    }
   })
//get all users
   router.get('/allUsers', jwtAuthMiddleware, isAdmin, async (req, res) => {
    try{
        const users=await User.find().select('-password -__v');

        if(users.length === 0) return res.status(404).json({message: 'No users found'});
         
        res.status(200).json({ message: 'Users fetched successfully',  users: users});
        console.log(users);
    }catch(err){
        console.error(err);
        return res.status(500).json({message: 'Failed to fetch users'});

    }
   });

//delete user by id
   router.delete('/deleteUser/:id', jwtAuthMiddleware, isAdmin, async (req, res) =>{
    try{
        const userID=await req.params.id;       
        const deleteUser= await User.findByIdAndDelete(userID);

        if(!deleteUser) return res.status(404).json({message: 'User not found'});
        return res.status(200).json({message: 'User deleted successfully'});
    }catch(err){
        console.error(err);
        return res.status(500).json({message: 'Failed to delete user'});
    }
   });


//get single user by id
   router.get('/singleUser/:id', jwtAuthMiddleware, isAdmin, async (req, res) => {
      try{
            const userID= req.params.id;
            const user=await User.findById(userID).select('-password -__v');
            if(!user) return res.status(404).json({message: 'User not found'});
        
            res.status(200).json({ message: 'User fetched', user: user});
      }catch(err){
        console.error(err);
        return res.status(500).json({message: 'Failed to fetch user'});
      }
   });


//change role of user 
router.put('/changeRole/:id', jwtAuthMiddleware, isAdmin, async (req, res) => {

  try{
    const userID= req.params.id;
    const {role} = req.body;
    const targetUser=await User.findById(userID);
    if(!targetUser) return res.status(404).json({message: 'User not found'});

    const allowedRoles=['user','admin'];
    if(!allowedRoles.includes(role)) return res.status(400).json({message: 'Invalid role'});

    targetUser.role=role;

    targetUser.save();

    res.status(200).json({message: 'Role changed successfully', user: targetUser});

  }catch(err){
    console.error(err);
    return res.status(500).json({message: 'Failed to change role'});
  }

});


    

module.exports=router;



