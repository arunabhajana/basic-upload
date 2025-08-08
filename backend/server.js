const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Enable CORS so frontend can talk to backend
app.use(cors());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve uploaded files if needed
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Storage setup for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.single('myFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded!' });
  }
  res.json({ message: `File uploaded: ${req.file.filename}` });
});

// Default route to load index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server is running at: http://localhost:${port}`);
});
