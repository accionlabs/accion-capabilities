import React, { useState, useEffect } from 'react';
import { DocumentIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { PDFViewer } from './PDFViewer';
import { getBasePath } from '../config/paths';

interface Citation {
  documentId: string;
  title: string;
  path: string;
  pages?: number[];
  extractionDate?: string;
  confidence?: string;
}

interface DocumentCitationsProps {
  entityId: string;
}

export const DocumentCitations: React.FC<DocumentCitationsProps> = ({ entityId }) => {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<{path: string, title: string} | null>(null);

  useEffect(() => {
    const loadCitations = async () => {
      try {
        const response = await fetch(`${getBasePath()}/data/citations.json`);
        const data = await response.json();
        
        console.log('Loading citations for entity:', entityId);
        console.log('Citations data:', data.citations?.[entityId]);
        
        if (data.citations && data.citations[entityId]) {
          setCitations(data.citations[entityId].sources || []);
        }
      } catch (error) {
        console.error('Error loading citations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCitations();
  }, [entityId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (citations.length === 0) {
    // Show a debug message in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`No citations found for entity: ${entityId}`);
    }
    return null;
  }

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
          <DocumentIcon className="h-4 w-4 mr-2" />
          Source Documents
        </h3>
        <div className="space-y-2">
          {citations.map((citation, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white rounded-lg px-3 py-2 hover:bg-blue-50 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {citation.title}
                </p>
                <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                  {citation.pages && (
                    <span>Pages: {citation.pages.join(', ')}</span>
                  )}
                  {citation.confidence && (
                    <span className="capitalize">
                      Confidence: {citation.confidence}
                    </span>
                  )}
                  {citation.extractionDate && (
                    <span>Extracted: {citation.extractionDate}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedDocument({ path: `${getBasePath()}${citation.path}`, title: citation.title })}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <span>View PDF</span>
                <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedDocument && (
        <PDFViewer
          documentPath={selectedDocument.path}
          documentTitle={selectedDocument.title}
          isModal={true}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </>
  );
};