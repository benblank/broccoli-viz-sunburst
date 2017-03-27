'use strict';

/**
 * Creates a map of ID -> node from a flat array of Broccoli
 * nodes.  Supports both `broccoli-viz.*.json`- and
 * `instrumentation.*.json`-style IDs.
 *
 * @param broccoliNodes {Array} An array of Broccoli nodes.
 * @returns {Map} A map of ID -> node.
 */
function getNodesById(broccoliNodes) {
  const broccoliNodeMap = new Map();

  broccoliNodes.forEach((node) => {
    broccoliNodeMap.set(typeof node._id !== 'undefined' ? node._id : node.id, node);
  });

  return broccoliNodeMap;
}

module.exports = getNodesById;
