import React, { useContext } from 'react';
import { GraphContext } from '../App';

const TestGraphPage: React.FC = () => {
  const { graph } = useContext(GraphContext);
  
  if (!graph) {
    return <div>Graph not loaded</div>;
  }
  
  const stats = graph.getStatistics();
  const allNodes = graph.findByType('coe');
  const testNode = graph.getNode('coe_devops');
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Graph Debug Information</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Graph Statistics:</h2>
        <pre>{JSON.stringify(stats, null, 2)}</pre>
      </div>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">All CoE IDs:</h2>
        <ul>
          {allNodes.map(node => (
            <li key={node.id}>
              {node.id} - {node.data.name}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Test: Get coe_devops directly:</h2>
        {testNode ? (
          <div>
            <p>Found: {testNode.data.name}</p>
            <pre>{JSON.stringify(testNode, null, 2)}</pre>
          </div>
        ) : (
          <p className="text-red-600">NOT FOUND</p>
        )}
      </div>
    </div>
  );
};

export default TestGraphPage;