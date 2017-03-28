'use strict';

/**
 * Converts a Broccoli node into a D3 node.
 *
 * Both `broccoli-viz.*.json`- and `instrumentation.*.json`-style nodes are
 * supported.
 *
 * @param broccoliNode {Object} The Broccoli node to convert.
 * @param childData {Array} An array of the data objects of the resulting D3 node's children.
 * @returns {{fsCount: number, fsTime: number, id: *, label: string, selfTime:
 *          number, totalFsCount: number, totalFsTime: number, totalSelfTime:
 *          number}} A dictionary of stats.
 */
function createNode(broccoliNode) {
  return {
    fsCount: getFsStat(broccoliNode, 'count'),
    fsTime: getFsStat(broccoliNode, 'time'),
    id: typeof broccoliNode._id !== 'undefined' ? broccoliNode._id : broccoliNode.id,
    label: (broccoliNode.label || broccoliNode.id).name,
    selfTime: broccoliNode.stats.time.self,
  };
}

/**
 * Calculate an FS stat for a Broccoli node.  If the node has no FS stats, 0 is returned.
 *
 * @param broccoliNode {Object} A Broccoli node.
 * @param key {string} The FS stat to calculate.
 * @returns {number} The total value for the requested stat.
 */
function getFsStat(broccoliNode, key) {
  if (!broccoliNode.stats.fs) {
    return 0;
  }

  return Object.keys(broccoliNode.stats.fs).reduce((total, stat) => total + (broccoliNode.stats.fs[stat][key] || 0), 0);
}

module.exports = {
  createNode,
  getFsStat,  // for testing
};
