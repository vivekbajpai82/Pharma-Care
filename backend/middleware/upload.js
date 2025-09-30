const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Cloudinary ko configure karein
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary par storage engine set karein
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pharma-care-uploads', // Cloudinary par folder ka naam
    allowed_formats: ['jpg', 'png', 'jpeg'], // Sirf in formats ko allow karein
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // Image ko chhota kar dein
  },
});

const upload = multer({ storage: storage });

module.exports = upload;