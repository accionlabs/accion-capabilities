import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MermaidDiagram from './MermaidDiagram';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {

  const components: Partial<Components> = {
    h1: ({children}) => <h1 className="text-3xl font-bold mb-4 mt-6">{children}</h1>,
    h2: ({children}) => <h2 className="text-2xl font-bold mb-3 mt-5">{children}</h2>,
    h3: ({children}) => <h3 className="text-xl font-semibold mb-2 mt-4">{children}</h3>,
    p: ({children}) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
    ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
    ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
    li: ({children}) => <li className="text-gray-700">{children}</li>,
    blockquote: ({children}) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 italic text-gray-600">
        {children}
      </blockquote>
    ),
    code: (props: any) => {
      const {className, children} = props;
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const isInline = !match;
      
      // Handle mermaid diagrams
      if (!isInline && language === 'mermaid') {
        const diagramCode = String(children).replace(/\n$/, '');
        return <MermaidDiagram diagram={diagramCode} />;
      }
      
      // Handle other code blocks
      if (!isInline) {
        return (
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4 overflow-x-auto">
            <code className={className}>{children}</code>
          </pre>
        );
      }
      
      // Handle inline code
      return (
        <code className="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm">
          {children}
        </code>
      );
    },
    table: ({children}) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full divide-y divide-gray-200">
          {children}
        </table>
      </div>
    ),
    thead: ({children}) => (
      <thead className="bg-gray-50">{children}</thead>
    ),
    tbody: ({children}) => (
      <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
    ),
    tr: ({children}) => <tr>{children}</tr>,
    th: ({children}) => (
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({children}) => (
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {children}
      </td>
    ),
    a: ({href, children}) => (
      <a 
        href={href} 
        className="text-blue-600 hover:text-blue-800 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    img: ({src, alt}) => (
      <img 
        src={src} 
        alt={alt || ''} 
        className="max-w-full h-auto rounded-lg shadow-md my-4"
      />
    ),
    hr: () => <hr className="my-6 border-gray-300" />,
    strong: ({children}) => <strong className="font-semibold">{children}</strong>,
    em: ({children}) => <em className="italic">{children}</em>
  };

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;