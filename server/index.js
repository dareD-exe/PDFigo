const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const os = require('os');

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

// Protect-pdf endpoint using qpdf
app.post('/api/protect-pdf', upload.single('pdf'), validateFile, (req, res) => {
  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `input_${Date.now()}.pdf`);
  const outputPath = path.join(tempDir, `protected_output_${Date.now()}.pdf`);

  try {
    const { password, permissions } = req.body;
    console.log('Received request with:', { 
      passwordLength: password?.length,
      permissions: permissions,
      fileSize: req.file?.size,
      userAgent: req.headers['user-agent']
    });

    // Check if the request is from a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(req.headers['user-agent']);
    
    // Adjust max file size for mobile devices
    const maxFileSize = isMobile ? 10 * 1024 * 1024 : 20 * 1024 * 1024; // 10MB for mobile, 20MB for desktop
    
    if (req.file.size > maxFileSize) {
      return res.status(400).json({
        error: `File size exceeds the limit. Maximum size is ${isMobile ? '10MB' : '20MB'} for ${isMobile ? 'mobile' : 'desktop'} devices.`
      });
    }

    const parsedPermissions = JSON.parse(permissions);
    const pdfBuffer = req.file.buffer;

    // Write the uploaded PDF to a temporary file
    fs.writeFileSync(inputPath, pdfBuffer);
    console.log('Temporary input file created at:', inputPath);

    // Map frontend permissions to qpdf 256-bit flags
    let printFlag = '--print=none';
    let extractFlag = '--extract=n';
    let modifyFlag = '--modify=none';

    if (parsedPermissions.printing) printFlag = '--print=full';
    if (parsedPermissions.copying) extractFlag = '--extract=y';
    
    // Handle modifying, annotating, and form filling
    if (parsedPermissions.modifying) {
      modifyFlag = '--modify=all';
    } else {
      const modifyOptions = [];
      if (parsedPermissions.annotating) modifyOptions.push('annotate');
      if (parsedPermissions.fillingForms) modifyOptions.push('form');
      if (modifyOptions.length > 0) {
        modifyFlag = `--modify=${modifyOptions.join(',')}`;
      }
    }

    // Start constructing qpdf command arguments with encryption options
    const qpdfArgs = [
      '--encrypt',
      password,
      password, // Owner password (using the same as user password)
      '256',
      printFlag,
      extractFlag,
      modifyFlag,
      '--',
      inputPath,
      outputPath
    ];

    console.log('Executing qpdf with arguments:', qpdfArgs);

    // Execute qpdf command with more detailed error handling
    const qpdfProcess = execFile('qpdf', qpdfArgs, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      console.log('qpdf process completed');
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
      console.log('error:', error);

      // Clean up temporary files after qpdf execution attempt
      fs.unlink(inputPath, (err) => { if (err) console.error('Error deleting input temp file:', err); });
      
      if (error) {
        console.error('qpdf execution error:', error);
        console.error('qpdf stderr:', stderr);
        console.error('qpdf stdout:', stdout);
        res.status(500).json({ 
          error: 'Error protecting PDF with qpdf',
          details: stderr || error.message
        });
        return;
      }

      // Check if the output file exists
      if (!fs.existsSync(outputPath)) {
        console.error('Output file not created by qpdf');
        res.status(500).json({ 
          error: 'Error protecting PDF: output file not created',
          details: stderr || 'qpdf did not create the output file'
        });
        return;
      }

      // Read the protected output file
      fs.readFile(outputPath, (readError, protectedPdfBuffer) => {
        if (readError) {
          console.error('Error reading protected PDF:', readError);
          res.status(500).json({ 
            error: 'Error reading protected PDF',
            details: readError.message
          });
          return;
        }

        // Set appropriate headers for mobile devices
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=protected_${req.file.originalname}`);
        res.setHeader('Content-Length', protectedPdfBuffer.length);
        
        // For mobile devices, add cache control headers
        if (isMobile) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }

        // Send the protected file to the client
        res.send(protectedPdfBuffer);

        // Clean up the output file after sending
        fs.unlink(outputPath, (err) => { if (err) console.error('Error deleting output temp file:', err); });
      });
    });

    // Add error handlers for the process
    qpdfProcess.on('error', (err) => {
      console.error('qpdf process error:', err);
      res.status(500).json({ 
        error: 'Error executing qpdf process',
        details: err.message
      });
    });

    qpdfProcess.on('exit', (code, signal) => {
      console.log('qpdf process exited with code:', code, 'signal:', signal);
    });

  } catch (error) {
    console.error('Error in protect-pdf endpoint:', error);
    res.status(500).json({ 
      error: 'Error protecting PDF',
      details: error.message
    });
  }
});

// Unlock-pdf endpoint using qpdf
app.post('/api/unlock-pdf', upload.single('pdf'), validateFile, (req, res) => {
  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `input_${Date.now()}.pdf`);
  const outputPath = path.join(tempDir, `unlocked_output_${Date.now()}.pdf`);

  try {
    const { password } = req.body;
    console.log('Received unlock request with:', { 
      passwordLength: password?.length,
      fileSize: req.file?.size,
      userAgent: req.headers['user-agent']
    });

    // Check if the request is from a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(req.headers['user-agent']);
    
    // Adjust max file size for mobile devices
    const maxFileSize = isMobile ? 10 * 1024 * 1024 : 20 * 1024 * 1024; // 10MB for mobile, 20MB for desktop
    
    if (req.file.size > maxFileSize) {
      return res.status(400).json({
        error: `File size exceeds the limit. Maximum size is ${isMobile ? '10MB' : '20MB'} for ${isMobile ? 'mobile' : 'desktop'} devices.`
      });
    }

    const pdfBuffer = req.file.buffer;

    // Write the uploaded PDF to a temporary file
    fs.writeFileSync(inputPath, pdfBuffer);
    console.log('Temporary input file created at:', inputPath);

    // Construct qpdf command arguments for unlocking
    const qpdfArgs = [
      '--password=' + password,
      '--decrypt',
      '--',
      inputPath,
      outputPath
    ];

    console.log('Executing qpdf with arguments:', qpdfArgs);

    // Execute qpdf command with more detailed error handling
    const qpdfProcess = execFile('qpdf', qpdfArgs, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      console.log('qpdf process completed');
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
      console.log('error:', error);

      // Clean up temporary files after qpdf execution attempt
      fs.unlink(inputPath, (err) => { if (err) console.error('Error deleting input temp file:', err); });
      
      if (error) {
        console.error('qpdf execution error:', error);
        console.error('qpdf stdout:', stdout);
        res.status(500).json({ 
          error: 'Error unlocking PDF with qpdf',
          details: stderr || error.message
        });
        return;
      }

      // Check if the output file exists
      if (!fs.existsSync(outputPath)) {
        console.error('Output file not created by qpdf');
        res.status(500).json({ 
          error: 'Error unlocking PDF: output file not created',
          details: stderr || 'qpdf did not create the output file'
        });
        return;
      }

      // Read the unlocked output file
      fs.readFile(outputPath, (readError, unlockedPdfBuffer) => {
        if (readError) {
          console.error('Error reading unlocked PDF:', readError);
          res.status(500).json({ 
            error: 'Error reading unlocked PDF',
            details: readError.message
          });
          return;
        }

        // Set appropriate headers for mobile devices
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=unlocked_${req.file.originalname}`);
        res.setHeader('Content-Length', unlockedPdfBuffer.length);
        
        // For mobile devices, add cache control headers
        if (isMobile) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }

        // Send the unlocked file to the client
        res.send(unlockedPdfBuffer);

        // Clean up the output file after sending
        fs.unlink(outputPath, (err) => { if (err) console.error('Error deleting output temp file:', err); });
      });
    });

    // Add error handlers for the process
    qpdfProcess.on('error', (err) => {
      console.error('qpdf process error:', err);
      res.status(500).json({ 
        error: 'Error executing qpdf process',
        details: err.message
      });
    });

  } catch (error) {
    console.error('Error in unlock-pdf endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 