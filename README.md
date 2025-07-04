# PDFigo - Your Ultimate PDF Toolkit

<div align="center">

![PDFigo Logo](https://img.shields.io/badge/PDFigo-PDF%20Toolkit-blue?style=for-the-badge&logo=adobe-acrobat-reader)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.8-38B2AC?style=for-the-badge&logo=tailwind-css)

**Access a suite of powerful tools to effortlessly manage, convert, and secure your PDF files. Fast, intuitive, and built for the future.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Now-green?style=for-the-badge)](https://pdfigo.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

## 🚀 Features

### Core PDF Operations
- **📄 PDF Merge** - Combine multiple PDF files into a single document
- **🖼️ PDF to Image** - Convert PDF pages to high-quality images
- **📷 Image to PDF** - Convert images to PDF format
- **✂️ Split PDF** - Split PDF documents into multiple files
- **🗜️ Compress PDF** - Reduce PDF file size while maintaining quality
- **🔄 Rotate PDF** - Rotate PDF pages as needed
- **🔒 Protect PDF** - Add password protection and permissions
- **🔓 Unlock PDF** - Remove password protection from PDFs
- **✏️ Edit PDF** - Modify PDF content and structure
- **🔢 Add Page Numbers** - Insert page numbers to PDF documents
- **📋 Rearrange PDF** - Reorder pages within PDF documents
- **🗑️ Remove Pages** - Delete specific pages from PDF files
- **📝 Flatten PDF** - Convert interactive elements to static content
- **✍️ Add Annotations** - Add comments and annotations to PDFs
- **💧 Add Text Watermark** - Insert text watermarks on PDF pages
- **📄 PDF to Text** - Extract text content from PDF files
- **📋 Add Headers & Footers** - Insert headers and footers to PDFs
- **✍️ Add Image Signature** - Add image-based signatures to PDFs

### Key Benefits
- ⚡ **Lightning Fast** - Process documents in seconds with optimized tools
- 🔒 **Privacy First** - Files processed locally, never stored on servers
- 💰 **Completely Free** - Unlimited access without hidden costs
- 🎨 **Modern UI** - Beautiful, intuitive interface with smooth animations
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🔐 **Secure** - Built with security best practices

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** - Modern React with latest features
- **Vite 6.3.5** - Fast build tool and development server
- **Tailwind CSS 4.1.8** - Utility-first CSS framework
- **Framer Motion 11.0.8** - Smooth animations and transitions
- **React Router DOM 7.6.1** - Client-side routing
- **React Icons 5.5.0** - Beautiful icon library
- **React Dropzone 14.3.8** - File upload functionality

### PDF Processing
- **PDF-lib 1.17.1** - PDF manipulation library
- **PDF.js 5.3.31** - PDF rendering and parsing
- **jsPDF 3.0.1** - PDF generation
- **jszip 3.10.1** - ZIP file handling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 4.18.2** - Web application framework
- **Multer 1.4.5** - File upload middleware
- **CORS 2.8.5** - Cross-origin resource sharing
- **Express Rate Limit 7.1.5** - Rate limiting for API protection
- **@cantoo/pdf-lib 2.4.1** - Advanced PDF manipulation

### Authentication & Database
- **Firebase 11.8.1** - Authentication and user management
- **Axios 1.9.0** - HTTP client for API requests

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/dareD-exe/pdfigo.git
   cd pdfigo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173` and the API server at `http://localhost:5000`.

## 🚀 Usage

### Getting Started

1. **Visit the application** at `http://localhost:5173`
2. **Sign up or log in** to access premium features
3. **Choose a tool** from the comprehensive toolkit
4. **Upload your files** using the drag-and-drop interface
5. **Configure settings** as needed for your specific use case
6. **Process and download** your modified PDF files

### Example Workflows

#### Merging Multiple PDFs
1. Navigate to "PDF Merge" tool
2. Upload multiple PDF files
3. Arrange them in desired order
4. Click "Merge PDFs" to combine them
5. Download the merged file

#### Protecting a PDF
1. Go to "Protect PDF" tool
2. Upload your PDF file
3. Set a strong password
4. Configure permissions (printing, copying, etc.)
5. Download the protected PDF

#### Converting Images to PDF
1. Select "Image to PDF" tool
2. Upload image files (JPG, PNG, etc.)
3. Arrange images in desired order
4. Set page size and orientation
5. Generate and download the PDF

## 🏗️ Project Structure

```
pdfigo/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components for each tool
│   ├── contexts/           # React context providers
│   ├── config/             # Configuration files
│   ├── assets/             # Static assets
│   ├── App.jsx             # Main application component
│   ├── Routes.jsx          # Application routing
│   └── main.jsx            # Application entry point
├── server/
│   ├── index.js            # Express server setup
│   ├── package.json        # Server dependencies
│   └── test-qpdf.js        # PDF processing utilities
├── public/                 # Public assets
├── package.json            # Frontend dependencies
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `VITE_API_BASE_URL` | Backend API URL | Yes |

### Build Configuration

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 🔒 Security Features

- **Rate Limiting** - API endpoints are protected against abuse
- **File Validation** - Strict file type and size validation
- **CORS Protection** - Configured cross-origin resource sharing
- **Local Processing** - Files processed in browser when possible
- **Secure Headers** - Proper security headers implementation

## 🧪 Testing

```bash
# Run linting
npm run lint

# Check for TypeScript errors
npm run type-check
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)
1. Push server code to your preferred platform
2. Set environment variables
3. Deploy the Express.js application

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PDF-lib** - For powerful PDF manipulation capabilities
- **React Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Framer Motion** - For smooth animations
- **Firebase** - For authentication and user management

## 📞 Support

- **Email**: support@pdfigo.com
- **Issues**: [GitHub Issues](https://github.com/dareD-exe/pdfigo/issues)
- **Documentation**: [Wiki](https://github.com/dareD-exe/pdfigo/wiki)

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release with comprehensive PDF toolkit
- 18+ PDF manipulation tools
- Modern React-based UI
- Firebase authentication
- Responsive design
- Local file processing for privacy

---

<div align="center">

**Made with ❤️ by Murtuja**

[![GitHub](https://img.shields.io/badge/GitHub-Follow-blue?style=social&logo=github)](https://github.com/dareD-exe)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-blue?style=social&logo=twitter)](https://twitter.com/dareD)

</div> 