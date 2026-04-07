# Document Forgery Detection System

A web application that detects if documents are genuine or forged by comparing them with original documents.

## Prerequisites

Install these before starting:

1. **Node.js** - Download from [nodejs.org](https://nodejs.org/)
2. **Python** - Download from [python.org](https://www.python.org/downloads/)
3. **Tesseract OCR** 
   - Windows: Download from [GitHub Tesseract](https://github.com/UB-Mannheim/tesseract/wiki) and add to PATH
   - Mac: `brew install tesseract`
   - Linux: `sudo apt-get install tesseract-ocr`

## Installation

### 1. Install Frontend Dependencies

```bash
cd document-forgery
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Python Dependencies

```bash
# Still in server directory
pip install -r requirements.txt
```

## How to Run

Open **3 separate terminal windows**:

### Terminal 1 - Python ML Service
```bash
cd server
python ml_verify.py
```
Wait for: `Running on http://127.0.0.1:5001`

### Terminal 2 - Node.js Backend
```bash
cd server
node index.js
```
Wait for: `Server running on http://localhost:5000`

### Terminal 3 - React Frontend
```bash
cd document-forgery
npm run dev
```
Wait for: `Local: http://localhost:5173/`

### Open Browser

Go to: **http://localhost:5173**

## Quick Start Guide

1. **Login/Register** - Create an account or login
2. **Upload Original** - Upload the original document you want to verify against
3. **Verify Document** - Upload a document to check if it matches the original
4. **View Results** - See the verification results with similarity scores

## Troubleshooting

### Port Already in Use
- Kill the process using that port or change the port number in the code

### Tesseract Not Found
- Make sure Tesseract is installed and added to your system PATH
- Restart your terminal after installing

### Python Modules Not Found
```bash
pip install -r requirements.txt
```

### Node Modules Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

## Project Structure

```
document-forgery/
├── src/              # React frontend code
├── server/           # Backend code
│   ├── index.js      # Node.js API server
│   └── ml_verify.py  # Python ML service
└── package.json      # Frontend dependencies
```

## Important Notes

- All 3 services must be running at the same time
- Make sure all dependencies are installed before running
- Check that Tesseract OCR is properly installed

---

That's it! Follow these steps and your application should be up and running.
