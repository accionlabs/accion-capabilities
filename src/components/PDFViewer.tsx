import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { getBasePath } from '../config/paths';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `${getBasePath()}/pdf.worker.min.js`;

interface PDFViewerProps {
  documentPath: string;
  documentTitle?: string;
  startPage?: number;
  onClose?: () => void;
  isModal?: boolean;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  documentPath,
  documentTitle,
  startPage = 1,
  onClose,
  isModal = false
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(startPage);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPageNumber(startPage);
  }, [startPage]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF document');
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || prev));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = documentPath;
    link.download = documentTitle || 'document.pdf';
    link.click();
  };

  const containerClass = isModal
    ? "fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
    : "h-full flex flex-col bg-white";

  const contentClass = isModal
    ? "bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col"
    : "h-full flex flex-col";

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <DocumentIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              {documentTitle || 'PDF Document'}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadPDF}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download PDF"
            >
              <ArrowDownTrayIcon className="h-5 w-5 text-gray-600" />
            </button>
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* PDF Controls */}
        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium px-3">
              Page {pageNumber} of {numPages || '...'}
            </span>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= (numPages || 1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MagnifyingGlassMinusIcon className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium px-2">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={scale >= 3}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MagnifyingGlassPlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* PDF Document */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="flex justify-center">
            {loading && (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}
            <Document
              file={documentPath}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                className="shadow-lg"
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
};