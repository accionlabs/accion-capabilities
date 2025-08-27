import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  diagram: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: '#fff',
    primaryTextColor: '#333',
    primaryBorderColor: '#333',
    lineColor: '#333',
    secondaryColor: '#f9f9f9',
    tertiaryColor: '#f0f0f0',
    background: 'white',
    mainBkg: '#fff',
    secondBkg: '#f9f9f9',
    tertiaryBkg: '#f0f0f0',
    textColor: '#333',
    nodeTextColor: '#333',
    edgeLabelBackground: '#fff',
    clusterBkg: '#fff',
    clusterBorder: '#333'
  },
  mindmap: {
    useMaxWidth: true,
    padding: 8
  }
});

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ diagram }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    const renderDiagram = async () => {
      if (!diagram || !containerRef.current) return;

      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, diagram);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Failed to render diagram');
        setSvg('');
      }
    };

    renderDiagram();
  }, [diagram]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4 my-4">
        <p className="text-red-600 font-semibold mb-2">{error}</p>
        <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-sm">
          <code>{diagram}</code>
        </pre>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .mermaid-container svg * {
            fill-opacity: 1 !important;
            stroke-opacity: 1 !important;
          }
          /* Regular diagram nodes */
          .mermaid-container .node rect,
          .mermaid-container .node circle,
          .mermaid-container .node ellipse,
          .mermaid-container .node polygon,
          .mermaid-container .node path {
            fill: white !important;
            stroke: #333 !important;
            stroke-width: 1.5px !important;
          }
          /* Mind map specific styles */
          .mermaid-container .mindmap-node circle,
          .mermaid-container .mindmap-node rect,
          .mermaid-container .mindmap-node ellipse {
            fill: white !important;
            stroke: #333 !important;
            stroke-width: 1.5px !important;
          }
          .mermaid-container .mindmap-node .label-container {
            background: white !important;
          }
          .mermaid-container .mindmap-edge {
            stroke: #333 !important;
            stroke-width: 1.5px !important;
          }
          /* Ensure all text is black */
          .mermaid-container text,
          .mermaid-container .nodeLabel,
          .mermaid-container .label {
            fill: #000 !important;
            color: #000 !important;
          }
          /* Edge paths and links */
          .mermaid-container .edgePath path,
          .mermaid-container .flowchart-link,
          .mermaid-container path.path {
            stroke: #333 !important;
            stroke-width: 1.5px !important;
          }
          /* Markers and arrows */
          .mermaid-container .marker,
          .mermaid-container marker path {
            fill: #333 !important;
            stroke: #333 !important;
          }
          /* Override any inline styles for mind maps */
          .mermaid-container [style*="fill"] {
            fill: white !important;
          }
          .mermaid-container [style*="stroke"]:not(text) {
            stroke: #333 !important;
          }
        }
      `}</style>
      <div 
        ref={containerRef}
        className="mermaid-container my-4 flex justify-center bg-gray-50 p-4 rounded-lg overflow-x-auto print:bg-white print:border print:border-gray-300"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </>
  );
};

export default MermaidDiagram;