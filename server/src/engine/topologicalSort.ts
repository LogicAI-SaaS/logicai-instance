/**
 * Topological Sort Implementation using Kahn's Algorithm
 * Used to determine execution order of nodes in a workflow
 */

export interface GraphNode {
  id: string;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Perform topological sort on a directed acyclic graph (DAG)
 * @param graph - The graph containing nodes and edges
 * @returns Array of node IDs in topological order
 * @throws Error if the graph contains a cycle
 */
export function topologicalSort(graph: Graph): string[] {
  // Build adjacency list and in-degree count
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize all nodes with empty adjacency list and 0 in-degree
  for (const node of graph.nodes) {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  // Build the graph
  for (const edge of graph.edges) {
    // Add edge from source to target
    const neighbors = adjacencyList.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacencyList.set(edge.source, neighbors);

    // Increment in-degree of target
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  // Find all nodes with 0 in-degree (no dependencies)
  const queue: string[] = [];
  for (const [nodeId, degree] of inDegree.entries()) {
    if (degree === 0) {
      queue.push(nodeId);
    }
  }

  // Process nodes in topological order
  const result: string[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    // Remove a node with 0 in-degree
    const nodeId = queue.shift()!;

    // Skip if already visited (can happen with duplicate edges)
    if (visited.has(nodeId)) {
      continue;
    }

    visited.add(nodeId);
    result.push(nodeId);

    // Reduce in-degree of all neighbors
    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);

      // If in-degree becomes 0, add to queue
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Check if topological sort includes all nodes
  // If not, there's a cycle in the graph
  if (result.length !== graph.nodes.length) {
    const cycleNodes = graph.nodes
      .filter(node => !visited.has(node.id))
      .map(node => node.id);

    throw new Error(
      `Graph contains a cycle. Topological sort not possible. ` +
      `Nodes involved in cycle: ${cycleNodes.join(', ')}`
    );
  }

  return result;
}

/**
 * Alternative topological sort that returns groups of nodes that can be executed in parallel
 * @param graph - The graph containing nodes and edges
 * @returns Array of arrays, where each inner array contains nodes that can be executed in parallel
 * @throws Error if the graph contains a cycle
 */
export function topologicalSortWithLevels(graph: Graph): string[][] {
  // Build adjacency list and in-degree count
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize all nodes
  for (const node of graph.nodes) {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  // Build the graph
  for (const edge of graph.edges) {
    const neighbors = adjacencyList.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacencyList.set(edge.source, neighbors);

    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  // Find all nodes with 0 in-degree
  const currentLevel: string[] = [];
  for (const [nodeId, degree] of inDegree.entries()) {
    if (degree === 0) {
      currentLevel.push(nodeId);
    }
  }

  const result: string[][] = [];
  const remaining = graph.nodes.length;

  while (currentLevel.length > 0) {
    // Add current level to result
    result.push([...currentLevel]);

    // Process all nodes in current level
    const nextLevel: string[] = [];
    for (const nodeId of currentLevel) {
      const neighbors = adjacencyList.get(nodeId) || [];

      for (const neighbor of neighbors) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);

        if (newDegree === 0) {
          nextLevel.push(neighbor);
        }
      }
    }

    // Move to next level
    currentLevel.length = 0;
    currentLevel.push(...nextLevel);
  }

  // Check for cycles
  const totalProcessed = result.reduce((sum, level) => sum + level.length, 0);
  if (totalProcessed !== graph.nodes.length) {
    throw new Error('Graph contains a cycle. Topological sort not possible.');
  }

  return result;
}

/**
 * Detect if a graph contains a cycle
 * @param graph - The graph to check
 * @returns True if the graph contains a cycle
 */
export function hasCycle(graph: Graph): boolean {
  try {
    topologicalSort(graph);
    return false;
  } catch (error) {
    return error instanceof Error && error.message.includes('cycle');
  }
}

/**
 * Get execution order for a workflow from React Flow format
 * @param nodes - Array of nodes from React Flow
 * @param edges - Array of edges from React Flow
 * @returns Array of node IDs in execution order
 */
export function getExecutionOrder(
  nodes: Array<{ id: string }>,
  edges: Array<{ source: string; target: string }>
): string[] {
  return topologicalSort({ nodes, edges });
}
