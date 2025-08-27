import React, { useContext } from 'react';
import { GraphContext } from '../App';

const DebugGraph: React.FC = () => {
  const { graph } = useContext(GraphContext);

  if (!graph) {
    return <div>Graph not loaded</div>;
  }

  // Test multiple entities
  const testEntities = ['platform_unifiedai', 'coe_data_analytics', 'tech_python'];
  
  const getEntityInfo = (entityId: string) => {
    const node = graph.getNode(entityId);
    const edges = graph.getEdges(entityId);
    const reverseEdges = graph.getReverseEdges(entityId);
    return { node, edges, reverseEdges };
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg text-xs space-y-4">
      <h3 className="font-bold text-lg">Graph Debug Info</h3>
      
      {testEntities.map(entityId => {
        const { node, edges, reverseEdges } = getEntityInfo(entityId);
        return (
          <div key={entityId} className="border-t pt-2">
            <h4 className="font-bold">{entityId}</h4>
            <p>Node exists: {node ? '✅ Yes' : '❌ No'}</p>
            {node && <p>Node name: {node.data.name}</p>}
            <p>Outgoing edges: {edges.length}</p>
            <p>Incoming edges: {reverseEdges.length}</p>
            
            {edges.length > 0 && (
              <div className="mt-2 ml-4">
                <h5 className="font-semibold">Outgoing:</h5>
                {edges.slice(0, 3).map((edge, idx) => (
                  <div key={idx}>
                    {edge.type} → {edge.to}
                  </div>
                ))}
                {edges.length > 3 && <div>... and {edges.length - 3} more</div>}
              </div>
            )}
            
            {reverseEdges.length > 0 && (
              <div className="mt-2 ml-4">
                <h5 className="font-semibold">Incoming:</h5>
                {reverseEdges.slice(0, 3).map((edge, idx) => (
                  <div key={idx}>
                    {edge.from} → {edge.type}
                  </div>
                ))}
                {reverseEdges.length > 3 && <div>... and {reverseEdges.length - 3} more</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DebugGraph;