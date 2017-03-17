'use strict';

/**
 * Build a tree of D3 nodes from a map of Broccoli nodes.
 *
 * @param broccoliNodeMap {Map} A map of Broccoli nodes by ID.
 * @param rootId {number} The ID of the root node.
 * @param createNodeData {Function} A function which creates D3 node data from
 *                                  a Broccoli node.
 * @param recurse {Function} (optional) The function used for recursing into
 *                           the tree.  Should not be used; only provided for
 *                           unit testing.
 * @returns {Object} A tree of D3 nodes.
 */
function buildTree(broccoliNodeMap, rootId, createNodeData, recurse = buildTree) {
  const d3Node = {
    children: []
  };
  
  const broccoliNode = broccoliNodeMap.get(rootId);

  broccoliNode.children.forEach((childId) => {
    d3Node.children.push(recurse(broccoliNodeMap, childId, createNodeData, recurse));
  });

  d3Node.data = createNodeData(broccoliNode, d3Node.children.map((node) => node.data));

  return d3Node;
}

module.exports = buildTree;
