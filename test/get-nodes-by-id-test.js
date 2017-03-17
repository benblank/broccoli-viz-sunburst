'use strict';

const getNodesById = require('../lib/get-nodes-by-id');
const expect = require('chai').expect;

describe('getNodesById', () => {
  it('correctly handles empty arrays', () => {
    const actual = getNodesById([]);

    expect(actual).to.be.a('map');
    expect(actual.size).to.equal(0);
  });

  it('correctly handles `instrumentation.*.json`-style IDs', () => {
    const actual = getNodesById([ { id: 535 } ]);

    expect(actual.has(535)).to.be.true;
  });

  it('correctly handles `broccoli-viz.*.json`-style IDs', () => {
    const actual = getNodesById([ { _id: 535 } ]);

    expect(actual.has(535)).to.be.true;
  });
});
