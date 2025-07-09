const multer= require('multer');

const storage= multer.memoryStorage();

const filterFile = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload=multer({storage,filterFile,limits:{
    fileSize: 1024 * 1024 * 5 // 5MB limit
}})


module.exports = upload;