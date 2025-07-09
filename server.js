const express=require('express');
const app=express();
require('dotenv').config();
const db=require('./config/db');
const userRoutes = require('./routes/userRoutes');
app.use(express.json());




app.use('/user',userRoutes)

const PORT=3000;
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});