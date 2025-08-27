import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { GraphContext } from '../App';

const TestPage: React.FC = () => {
  const { graph } = useContext(GraphContext);

  if (!graph) {
    return <div className="p-8">Graph not loaded yet...</div>;
  }

  // Get all nodes and check their relationships
  const stats = graph.getStatistics();
  
  // Test specific entities
  const testCases = [
    { id: 'platform_unifiedai', name: 'Unified AI Platform' },
    { id: 'coe_data_analytics', name: 'Data Analytics CoE' },
    { id: 'tech_python', name: 'Python' }
  ];

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Relationship Test Page</h1>
      
      <div className="bg-blue-50 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Graph Statistics</h2>
        <p>Total Nodes: {stats.totalNodes}</p>
        <p>Total Edges: {stats.totalEdges}</p>
        <p>Average Connections: {stats.avgConnections.toFixed(2)}</p>
      </div>

      <div className="space-y-6">
        {testCases.map(test => {
          const node = graph.getNode(test.id);
          const outgoing = graph.getEdges(test.id);
          const incoming = graph.getReverseEdges(test.id);
          
          return (
            <div key={test.id} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">
                {test.name} ({test.id})
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Outgoing Relationships ({outgoing.length})
                  </h3>
                  {outgoing.length === 0 ? (
                    <p className="text-gray-500">No outgoing relationships</p>
                  ) : (
                    <ul className="space-y-2">
                      {outgoing.map((edge, idx) => {
                        const target = graph.getNode(edge.to);
                        return (
                          <li key={idx} className="border-l-2 border-blue-400 pl-3">
                            <span className="font-medium text-blue-600">{edge.type}</span>
                            <span className="mx-2">→</span>
                            <Link 
                              to={`/${target?.type}/${edge.to}`}
                              className="text-gray-700 hover:text-blue-600"
                            >
                              {target?.data.name || edge.to}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Incoming Relationships ({incoming.length})
                  </h3>
                  {incoming.length === 0 ? (
                    <p className="text-gray-500">No incoming relationships</p>
                  ) : (
                    <ul className="space-y-2">
                      {incoming.map((edge, idx) => {
                        const source = graph.getNode(edge.from);
                        return (
                          <li key={idx} className="border-l-2 border-green-400 pl-3">
                            <Link 
                              to={`/${source?.type}/${edge.from}`}
                              className="text-gray-700 hover:text-blue-600"
                            >
                              {source?.data.name || edge.from}
                            </Link>
                            <span className="mx-2">→</span>
                            <span className="font-medium text-green-600">{edge.type}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          If you see "No outgoing/incoming relationships" above, it means the relationships.json file is not being loaded properly.
          Check the browser console for any errors.
        </p>
      </div>
    </div>
  );
};

export default TestPage;