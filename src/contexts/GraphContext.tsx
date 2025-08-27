import React, { useContext } from 'react';
import { CapabilityGraph } from '../services/CapabilityGraph';
import { CapabilityQueryBuilder } from '../services/CapabilityQueryBuilder';
import { GraphContext } from '../App';

interface GraphContextType {
  graph: CapabilityGraph | null;
  queryBuilder: CapabilityQueryBuilder | null;
}

export const useGraph = () => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraph must be used within a GraphContext provider');
  }
  return context;
};