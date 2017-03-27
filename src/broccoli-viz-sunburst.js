/* exported loadData */
/* global d3 */

'use strict';

function loadData(trees) {
  const width = 960;
  const height = 960;
  const radius = (Math.min(width, height) / 2) - 10;
  const x = d3.scaleLinear().range([0, 2 * Math.PI]);
  const y = d3.scaleLinear().range([0, radius]);
  const color = d3.scaleOrdinal(d3.schemeCategory20);
  const partition = d3.partition();
  const tooltip = d3.select('#tooltip');
  const treeSelector = d3.select('#trees');
  const unzoomButton = d3.select('#unzoom');
  let root;
  let svg;

  for (const tree in trees) {
    treeSelector.append('option').attr('value', tree).text(tree);
  }

  const arc = d3.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });

  renderTree(trees[treeSelector.property('value')]);

  treeSelector.on('change', selectTree);
  unzoomButton.on('click', unzoom);

  function anchorTooltip(/* d */) {
    tooltip.style('top', (d3.event.pageY - 10) + 'px');
    tooltip.style('left', (d3.event.pageX + 10) + 'px');
  }

  function click(d) {
    unzoomButton.attr('disabled', d === root ? 'disabled' : null);

    svg.transition()
      .duration(750)
      .tween('scale', function() {
        const xd = d3.interpolate(x.domain(), [d.x0, d.x1]);
        const yd = d3.interpolate(y.domain(), [d.y0, 1]);
        const yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);

        return function(t) {
          x.domain(xd(t));
          y.domain(yd(t)).range(yr(t));
        };
      })
      .selectAll('path')
      .attrTween('d', function(d) { return function() { return arc(d); }; });
  }

  function hideTooltip(/* d */) {
    tooltip.style('display', 'none');
  }

  function renderTooltip(d) {
    const text = [
      d.data.label,
      'Self time: ' + timeInMs(d.data.selfTime) + 'ms',
      'Total time: ' + timeInMs(d.data.totalSelfTime) + 'ms',
      'I/O time: ' + timeInMs(d.data.fsTime) + 'ms',
      'I/O count: ' + d.data.fsCount,
    ];

    tooltip.text(text.join('\n'));
    tooltip.style('display', 'block');
  }

  function renderTree(tree) {
    root = d3.hierarchy(tree);
    root.sum(function(d) { return d.selfTime; });
    root = partition(root);

    d3.selectAll('svg').remove();

    svg = d3.select('body').append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + (height / 2) + ')');

    svg.selectAll('path')
      .data(root.descendants())
      .enter().append('path')
      .attr('d', arc)
      .style('fill', function(d) { return color(d.data.label); })
      .on('click', click)
      .on('mouseover', renderTooltip)
      .on('mousemove', anchorTooltip)
      .on('mouseout', hideTooltip);
  }

  function selectTree() {
    renderTree(trees[d3.event.target.value]);
    unzoom();
  }

  function timeInMs(ns) {
    return Math.round(ns / 1e6);
  }

  function unzoom() {
    click(root);
  }
}
