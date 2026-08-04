import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BackgroundMesh from '../components/BackgroundMesh';
import { aiService } from '../services/api';
import { FiUploadCloud, FiFileText, FiBookOpen } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import '../styles/PdfSummarizer.css';

function PdfSummarizer() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await aiService.getDocuments();
      setDocuments(res.data);
      if (res.data.length > 0) {
        setSelectedDoc(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const res = await aiService.uploadPdf(file);
      setDocuments((prev) => [res.data, ...prev]);
      setSelectedDoc(res.data);
      setFile(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to upload and summarize PDF.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <BackgroundMesh />
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        <motion.main 
          className="dashboard-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="page-header">
            <h2>📄 PDF Study Notes Summarizer (RAG Ready)</h2>
            <p>Upload PDF lecture notes or research papers for instant AI text extraction & study guide generation</p>
          </div>

          <div className="pdf-layout">
            <div className="upload-box-card glass-panel">
              <h3><FiUploadCloud /> Upload PDF Document</h3>
              <form onSubmit={handleUpload} className="upload-form">
                <div className="file-dropzone-dark">
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileChange}
                    id="pdf-input"
                  />
                  <label htmlFor="pdf-input">
                    <FiFileText className="file-icon" />
                    <span>{file ? file.name : 'Click or Drag PDF file here'}</span>
                  </label>
                </div>
                <motion.button 
                  type="submit" 
                  className="upload-btn" 
                  disabled={!file || uploading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {uploading ? 'Extracting & Summarizing with AI...' : 'Upload & Generate Summary'}
                </motion.button>
              </form>

              <div className="doc-history">
                <h4>Uploaded Documents ({documents.length})</h4>
                <ul>
                  {documents.map((d) => (
                    <li 
                      key={d.id} 
                      className={selectedDoc?.id === d.id ? 'active' : ''}
                      onClick={() => setSelectedDoc(d)}
                    >
                      <FiBookOpen />
                      <span>{d.filename}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="summary-display-card glass-panel">
              {selectedDoc ? (
                <>
                  <div className="summary-header">
                    <h3>{selectedDoc.filename}</h3>
                    <span className="date">Uploaded: {new Date(selectedDoc.uploaded_at).toLocaleDateString()}</span>
                  </div>
                  <div className="summary-content">
                    <h4><HiOutlineSparkles /> AI Generated Study Guide & Summary</h4>
                    <pre>{selectedDoc.summary}</pre>
                  </div>
                </>
              ) : (
                <div className="empty-summary-state">
                  <FiFileText className="empty-icon" />
                  <p>Select a document or upload a new PDF to view the AI summary.</p>
                </div>
              )}
            </div>
          </div>
        </motion.main>
      </div>
    </>
  );
}

export default PdfSummarizer;
