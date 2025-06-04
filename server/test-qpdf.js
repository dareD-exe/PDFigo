const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const tempDir = os.tmpdir();
const inputPath = path.join(tempDir, 'test_input.pdf');
const outputPath = path.join(tempDir, 'test_output.pdf');

// Create a simple PDF file for testing
const pdfContent = '%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF';
fs.writeFileSync(inputPath, pdfContent);

const qpdfArgs = [
  '--encrypt',
  'test123',
  'test123',
  '256',
  '--accessibility=y',
  '--extract=y',
  '--modify=none',
  '--print=none',
  '--',
  inputPath,
  outputPath
];

console.log('Testing qpdf with arguments:', qpdfArgs);

execFile('qpdf', qpdfArgs, (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error);
    console.error('stderr:', stderr);
    console.error('stdout:', stdout);
  } else {
    console.log('Success!');
    console.log('stdout:', stdout);
    
    // Verify the output file exists
    if (fs.existsSync(outputPath)) {
      console.log('Output file created successfully');
      const stats = fs.statSync(outputPath);
      console.log('Output file size:', stats.size, 'bytes');
    } else {
      console.log('Output file was not created');
    }
  }
  
  // Cleanup
  try {
    fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  } catch (err) {
    console.error('Cleanup error:', err);
  }
}); 