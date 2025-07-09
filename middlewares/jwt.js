const jwt=require('jsonwebtoken');
require('dotenv').config();
  const generateToken=(userData)=>{
    const payload={
        id: userData._id,
        role: userData.role
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h' 
  })
  return token;

}


const jwtAuthMiddleware=(req, res, next)=>{
    const authHeader = req.headers.authorization;
    if (!authHeader)return res.status(401).json({ message: 'token not found' });
    const token= req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'token not found ' });
    try{
        const decode=jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next();
    }catch(err){

        return res.status(401).json({ message: 'invalid token' });

}
}

module.exports = {
    generateToken,
    jwtAuthMiddleware
}