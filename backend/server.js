const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

// S3 client config
const s3Client = new S3Client({ region: 'ap-southeast-2' });
const bucketName = 'arunabhajana24';

// Multer: store files temporarily in memory or disk
const storage = multer.memoryStorage(); // or use diskStorage if needed
const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.single('myFile'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded!' });

  const fileName = `${Date.now()}-${req.file.originalname}`;

  try {
    const parallelUpload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: 'public-read'
      }
    });

    await parallelUpload.done();

    const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;
    res.json({
      message: '✅ File uploaded to S3 successfully!',
      fileUrl
    });
  } catch (err) {
    console.error('❌ S3 Upload Error:', err);
    res.status(500).json({ message: 'S3 upload failed', error: err.message });
  }
});

// Load frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(port, () => {
  console.log(`✅ Server is running at: http://localhost:${port}`);
});
