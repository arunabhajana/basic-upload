const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Enable CORS so frontend can talk to backend
app.use(cors());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// AWS SDK Configuration
AWS.config.update({ region: 'us-east-1' });

const s3 = new AWS.S3();
const bucketName = 'file-uploads'; // ⬅️ replace with your actual bucket name

// Multer S3 storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    acl: 'public-read', // or 'private' if you want restricted access
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});

// Upload endpoint
app.post('/upload', upload.single('myFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded!' });
  }
  res.json({
    message: `File uploaded to S3 successfully!`,
    fileUrl: req.file.location // ⬅️ S3 public URL
  });
});

// Default route to load index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server is running at: http://localhost:${port}`);
});
