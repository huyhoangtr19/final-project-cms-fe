import React, { useState, useEffect } from 'react';

import { Document, Page, pdfjs } from 'react-pdf';
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// import 'react-pdf/dist/esm/Page/TextLayer.css';
// import '../../node_modules/react-pdf/dist/annotation-layer.css';
// import '../../node_modules/react-pdf/dist/text-layer.css';

// Cần cấu hình workerSrc cho react-pdf để nó hoạt động
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfViewer = ({fileBlob}) => {
//   const [fileBlob, setFileBlob] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if(fileBlob){
        setLoading(false)
    }
  },[fileBlob])
//   useEffect(() => {
//     const fetchPdf = async () => {
//       try {
//         setLoading(true);
//         // Gọi API để lấy dữ liệu PDF dưới dạng base64
//         const response = await axios.get('https://api.example.com/get-pdf-base64');
//         const fileToBytes = response.data.fileToBytes;

//         if (fileToBytes) {
//           // Chuyển đổi chuỗi base64 thành một Blob
//           // Bất cứ khi nào bạn thấy "JVBERi0xLjQK" thì nó luôn là header của một file PDF base64
//           const byteCharacters = atob(fileToBytes);
//           const byteNumbers = new Array(byteCharacters.length);
//           for (let i = 0; i < byteCharacters.length; i++) {
//             byteNumbers[i] = byteCharacters.charCodeAt(i);
//           }
//           const byteArray = new Uint8Array(byteNumbers);
//           const blob = new Blob([byteArray], { type: 'application/pdf' });
//           setFileBlob(blob);
//         } else {
//           setError('Không có dữ liệu file PDF.');
//         }
//       } catch (err) {
//         console.error('Lỗi khi lấy file PDF:', err);
//         setError('Không thể tải file PDF.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPdf();
//   }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  if (loading) {
    return <p>Đang tải file PDF...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>Trình xem PDF</h1>
      {fileBlob ? (
        <>
          <div style={{ border: '1px solid #ccc', marginBottom: '10px' }}>
            <Document  linkService={pdfjs.getDocument(fileBlob)} file={fileBlob} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={pageNumber} />
            </Document>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p>Trang {pageNumber} trên {numPages}</p>
            <button
              onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
              disabled={pageNumber <= 1}
              style={{ marginRight: '10px' }}
            >
              Trang trước
            </button>
            <button
              onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
              disabled={pageNumber >= numPages}
            >
              Trang sau
            </button>
          </div>
        </>
      ) : (
        <p>Không có file PDF để hiển thị.</p>
      )}
    </div>
  );
};

export default PdfViewer;