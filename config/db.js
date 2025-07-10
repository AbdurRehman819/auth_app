const mongoose=require('mongoose');


const mongodbURI=process.env.LOCALHOSt_URL;

mongoose.connect(mongodbURI, { useUnifiedTopology: true, useNewUrlParser: true});


const db=mongoose.connection;


db.on('connected',()=>{
    console.log(' MongoDB connected successfully');
});

db.on('disconnected',(()=>{
    console.log(' MongoDB disconnected');
}))

db.on('error', (err) => {
    console.error(' MongoDB connection error:', err);
});


module.exports = db;