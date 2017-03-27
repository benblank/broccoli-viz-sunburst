'use strict';

const { createNode, getFsStat, getTotal } = require('../lib/create-node');
const expect = require('chai').expect;

describe('createNode', () => {
  const broccoliNodeComplete = {
    id: 535,
    label: { name: 'foo' },
    stats: {
      fs: { lstatSync: { count: 10, time: 200 } },
      time: { self: 100 },
    },
  };

  const broccoliNodeWithoutFs = {
    id: 535,
    label: { name: 'foo' },
    stats: {
      time: { self: 100 },
    },
  };

  const broccoliNodeOld = {
    _id: 535,
    id: { name: 'foo' },
    stats: {
      fs: { lstatSync: { count: 10, time: 200 } },
      time: { self: 100 },
    },
  };

  const d3Node = {
    fsCount: 1,
    fsTime: 2,
    id: 535,
    label: 'foo',
    selfTime: 3,
    totalFsCount: 4,
    totalFsTime: 5,
    totalSelfTime: 6,
  };

  it('converts an `instrumentation.*.json`-style node', () => {
    expect(createNode(broccoliNodeComplete, [])).to.deep.equal({
      fsCount: 10,
      fsTime: 200,
      id: 535,
      label: 'foo',
      selfTime: 100,
      totalFsCount: 10,
      totalFsTime: 200,
      totalSelfTime: 100,
    });
  });

  it('converts an `broccoli-viz.*.json`-style node', () => {
    expect(createNode(broccoliNodeOld, [])).to.deep.equal({
      fsCount: 10,
      fsTime: 200,
      id: 535,
      label: 'foo',
      selfTime: 100,
      totalFsCount: 10,
      totalFsTime: 200,
      totalSelfTime: 100,
    });
  });

  it('correctly handles nodes without FS stats', () => {
    expect(createNode(broccoliNodeWithoutFs, [])).to.deep.equal({
      fsCount: 0,
      fsTime: 0,
      id: 535,
      label: 'foo',
      selfTime: 100,
      totalFsCount: 0,
      totalFsTime: 0,
      totalSelfTime: 100,
    });
  });

  it('includes child data in totals', () => {
    expect(createNode(broccoliNodeComplete, [ d3Node ])).to.deep.equal({
      fsCount: 10,
      fsTime: 200,
      id: 535,
      label: 'foo',
      selfTime: 100,
      totalFsCount: 14,
      totalFsTime: 205,
      totalSelfTime: 106,
    });
  });
});

describe('getFsStat', () => {
  it('sums the selected stat', () => {
    const broccoliNode = {
      stats: {
        fs: {
          foo: { count: 1 },
          bar: { count: 2 },
          baz: { count: 3 },
        }
      }
    };

    expect(getFsStat(broccoliNode, 'count')).to.equal(6);
  });

  it('ignores other stats', () => {
    const broccoliNode = {
      stats: {
        fs: {
          foo: { count: 1, time: 1 },
          bar: { count: 2, time: 1 },
          baz: { count: 3, time: 1 },
        }
      }
    };

    expect(getFsStat(broccoliNode, 'count')).to.equal(6);
  });

  it('correctly handles a missing FS block', () => {
    const broccoliNode = { stats: {} };

    expect(getFsStat(broccoliNode, 'count')).to.equal(0);
  });

  it('correctly handles an empty FS block', () => {
    const broccoliNode = { stats: { fs: {} } };

    expect(getFsStat(broccoliNode, 'count')).to.equal(0);
  });

  it('correctly handles a missing stat', () => {
    const broccoliNode = {
      stats: {
        fs: {
          foo: { time: 1 },
        }
      }
    };

    expect(getFsStat(broccoliNode, 'count')).to.equal(0);
  });
});

describe('getTotal', () => {
  it('sums the selected property', () => {
    const data = [
      { foo: 1 },
      { foo: 2 },
      { foo: 3 },
    ];

    expect(getTotal(data, 'foo')).to.equal(6);
  });

  it('ignores other properties', () => {
    const data = [
      { foo: 1, bar: 1 },
      { foo: 2, bar: 1 },
      { foo: 3, bar: 1 },
    ];

    expect(getTotal(data, 'foo')).to.equal(6);
  });

  it('correctly handles an empty array', () => {
    expect(getTotal([], 'foo')).to.equal(0);
  });

  it('correctly handles missing properties', () => {
    const data = [
      { bar: 1 },
    ];

    expect(getTotal(data, 'foo')).to.equal(0);
  });
});
