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

  const arc = d3.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });

  const tooltip = d3.select('body').append('div')
    .style('display', 'none')
    .style('background', 'white')
    .style('border', '1px solid black')
    .style('padding', '0.3em 0.5em')
    .style('position', 'absolute')
    .style('white-space', 'pre');

  const svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + (height / 2) + ')');

  let root = d3.hierarchy(trees['instrumentation.build.0.json']);

  root.sum(function(d) { return d.selfTime; });

  svg.selectAll('path')
    .data(partition(root).descendants())
    .enter().append('path')
    .attr('d', arc)
    .style('fill', function(d) { return color(d.data.label); })
    .on('click', click)
    .on('mouseover', renderTooltip)
    .on('mousemove', anchorTooltip)
    .on('mouseout', hideTooltip);

  function anchorTooltip(/* d */) {
    tooltip.style('top', (d3.event.pageY - 10) + 'px');
    tooltip.style('left', (d3.event.pageX + 10) + 'px');
  }

  function click(d) {
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
      'I/O count: ' + d.data.fsCount
    ];

    tooltip.text(text.join('\n'));
    tooltip.style('display', '');
  }

  function timeInMs(ns) {
    return Math.round(ns / 1e6);
  }
}
