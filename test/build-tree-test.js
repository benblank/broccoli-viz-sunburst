'use strict';

const buildTree = require('../lib/build-tree');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('buildTree', () => {
  const broccoliNodeMap = new Map();

  broccoliNodeMap.set(535, {
    id: 535,
    label: { name: 'foo' },
    stats: {
      fs: { lstatSync: { count: 10, time: 200 } },
      time: { self: 100 },
    },
    children: [ 626, 717 ],
  });

  broccoliNodeMap.set(626, {
    id: 626,
    label: { name: 'bar' },
    stats: {
      fs: { lstatSync: { count: 1, time: 20 } },
      time: { self: 10 },
    },
    children: [],
  });

  broccoliNodeMap.set(717, {
    id: 717,
    label: { name: 'baz' },
    stats: {
      fs: { lstatSync: { count: 2, time: 30 } },
      time: { self: 20 },
    },
    children: [],
  });

  const d3Node = {
    children: []
  };

  it('produces a D3 node', () => {
    const createNode = () => d3Node;
    const recurse = () => {};

    const actual = buildTree(broccoliNodeMap, 626, createNode, recurse);

    expect(actual).to.deep.equal(d3Node);
  });

  it('produces a D3 tree', () => {
    const createNode = () => d3Node;
    const recurse = () => d3Node;

    const actual = buildTree(broccoliNodeMap, 535, createNode, recurse);

    expect(actual).to.deep.equal({ children: [ d3Node, d3Node ] });
  });

  it('recurses into each child', () => {
    const createNode = () => d3Node;
    const recurse = sinon.stub().returns(d3Node);

    buildTree(broccoliNodeMap, 535, createNode, recurse);

    expect(recurse.callCount).to.equal(2);
    expect(recurse.firstCall.args).to.deep.equal([ broccoliNodeMap, 626, createNode, recurse ]);
    expect(recurse.secondCall.args).to.deep.equal([ broccoliNodeMap, 717, createNode, recurse ]);
  });

  it('calls createNode', () => {
    const createNode = sinon.stub().returns(d3Node);
    const recurse = () => d3Node;

    buildTree(broccoliNodeMap, 535, createNode, recurse);

    expect(createNode.callCount).to.equal(1);
    expect(createNode.firstCall.args).to.deep.equal([ broccoliNodeMap.get(535) ]);
  });
});
