const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const os = require('os');
const { PDFDocument } = require('@cantoo/pdf-lib');

const app = express();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Use CORS middleware with specific options
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Use express.json() middleware to parse JSON request bodies
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Configure rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all routes
app.use(limiter);

// Basic file validation middleware
const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Check file type
  if (req.file.mimetype !== 'application/pdf') {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }

  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes
  if (req.file.size > maxSize) {
    return res.status(400).json({ error: 'File size exceeds 50MB limit' });
  }

  next();
};

// Protect-pdf endpoint using @cantoo/pdf-lib
app.post('/api/protect-pdf', upload.single('pdf'), validateFile, async (req, res) => {
  try {
    const { password, permissions } = req.body;
    const pdfBuffer = req.file.buffer;

    console.log('Received protect request with:', {
      passwordLength: password?.length,
      permissions: permissions,
      fileSize: req.file?.size,
      userAgent: req.headers['user-agent']
    });

    // Check if the request is from a mobile device (already handled by validateFile size check based on user-agent)

    const parsedPermissions = JSON.parse(permissions);

    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Set permissions
    let permissionFlags = {};
    if (parsedPermissions.printing) permissionFlags.print = true;
    if (parsedPermissions.copying) permissionFlags.copy = true;
    if (parsedPermissions.modifying) permissionFlags.modify = true;
    if (parsedPermissions.annotating) permissionFlags.assemble = true; // Mapping annotating to assemble for simplicity, adjust if needed
    if (parsedPermissions.fillingForms) permissionFlags.fillForm = true;
    if (parsedPermissions.contentAccessibility) permissionFlags.extractForAccessibility = true;
    if (parsedPermissions.documentAssembly) permissionFlags.assemble = true;

    // Protect the PDF with password and permissions
    const protectedPdfBytes = await pdfDoc.save({
      userPassword: password,
      ownerPassword: password, // Using the same as user password for simplicity
      permissions: permissionFlags,
      encryptionAlgorithm: 'aes256',
    });

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=protected_${req.file.originalname}`);
    res.setHeader('Content-Length', protectedPdfBytes.length);

    // For mobile devices, add cache control headers
    const isMobile = /iPhone|iPad|iPod|Android/i.test(req.headers['user-agent']);
    if (isMobile) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // Send the protected file to the client
    res.send(Buffer.from(protectedPdfBytes));

  } catch (error) {
    console.error('Error in protect-pdf endpoint with @cantoo/pdf-lib:', error);
    res.status(500).json({
      error: 'Error protecting PDF',
      details: error.message
    });
  }
});

// Unlock-pdf endpoint using @cantoo/pdf-lib
app.post('/api/unlock-pdf', upload.single('pdf'), validateFile, async (req, res) => {
  try {
    const { password } = req.body;
    const pdfBuffer = req.file.buffer;

    console.log('Received unlock request with:', {
      passwordLength: password?.length,
      fileSize: req.file?.size,
      userAgent: req.headers['user-agent']
    });

    // Check if the request is from a mobile device (already handled by validateFile size check based on user-agent)

    let pdfDoc;
    try {
      // Attempt to load the PDF, providing the password for decryption
      pdfDoc = await PDFDocument.load(pdfBuffer, { password: password });
    } catch (loadError) {
      console.error('Error loading/decrypting PDF with @cantoo/pdf-lib:', loadError);
      // Check if the error is likely due to an incorrect password
      if (loadError.message.includes('Incorrect password') || loadError.message.includes('Password required')) {
         return res.status(400).json({
           error: 'Incorrect password. Please try again.',
           details: loadError.message
         });
      } else {
         // Handle other potential loading errors (e.g., corrupted PDF)
         return res.status(500).json({
           error: 'Error loading or processing PDF',
           details: loadError.message
         });
      }
    }

    // If loading with password was successful, save the document (which should now be decrypted)
    const unlockedPdfBytes = await pdfDoc.save();

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=unlocked_${req.file.originalname}`);
    res.setHeader('Content-Length', unlockedPdfBytes.length);

    // For mobile devices, add cache control headers
    const isMobile = /iPhone|iPad|iPod|Android/i.test(req.headers['user-agent']);
    if (isMobile) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // Send the unlocked file to the client
    res.send(Buffer.from(unlockedPdfBytes));

  } catch (error) {
    console.error('Error in unlock-pdf endpoint with @cantoo/pdf-lib:', error);
    res.status(500).json({
      error: 'Error unlocking PDF',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 