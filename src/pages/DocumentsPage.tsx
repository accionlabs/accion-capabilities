import React, { useState, useEffect } from 'react';
import { 
  DocumentIcon, 
  FolderIcon, 
  TagIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { PDFViewer } from '../components/PDFViewer';
import { getBasePath } from '../config/paths';

interface Document {
  id: string;
  title: string;
  category: string;
  originalPath: string;
  publicPath: string;
  description: string;
  metadata: {
    uploadDate: string;
    tags: string[];
    extractedEntities: string[];
  };
}

interface Category {
  name: string;
  description: string;
}

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await fetch(`${getBasePath()}/data/documents.json`);
        const data = await response.json();
        setDocuments(data.documents || []);
        setCategories(data.categories || {});
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const documentsByCategory = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (selectedDocument) {
    return (
      <div className="h-full">
        <div className="border-b bg-white px-6 py-3">
          <button
            onClick={() => setSelectedDocument(null)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Documents
          </button>
        </div>
        <div className="h-[calc(100%-60px)]">
          <PDFViewer
            documentPath={`${getBasePath()}${selectedDocument.publicPath}`}
            documentTitle={selectedDocument.title}
            isModal={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Source Documents</h1>
        <p className="text-gray-600 mt-1">
          Browse and view all reference documents and PDFs
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {Object.entries(categories).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(documentsByCategory).map(([categoryKey, docs]) => (
              <div key={categoryKey}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FolderIcon className="h-5 w-5 mr-2 text-gray-500" />
                  {categories[categoryKey]?.name || categoryKey}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <DocumentIcon className="h-8 w-8 text-blue-500" />
                          <span className="text-xs text-gray-500 flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {doc.metadata.uploadDate}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {doc.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {doc.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {doc.metadata.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                            >
                              <TagIcon className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {doc.metadata.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{doc.metadata.tags.length - 3} more
                            </span>
                          )}
                        </div>
                        {doc.metadata.extractedEntities.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs text-gray-500">
                              {doc.metadata.extractedEntities.length} entities extracted
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;