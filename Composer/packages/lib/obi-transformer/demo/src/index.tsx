import React, { Component } from 'react';
import { render } from 'react-dom';
import './style.css';

import dagre from 'dagre';

import { ObiTransformer, defaultPolicy } from '../../src';
import * as sampleJson from './sample-input.json';

declare var dagreD3;
declare var d3;
declare var window;

const { nodes, edges } = new ObiTransformer(defaultPolicy).transform(sampleJson as any);

/**
 * This demo shows how to consume a transformed OBI json to a directed graph via the DagreD3 library.
 */
class Demo extends Component {
  componentDidMount() {
    this.mountD3();
  }

  mountD3() {
    const g = new dagre.graphlib.Graph().setGraph({}).setDefaultEdgeLabel(() => ({}));
    const render = new dagreD3.render();

    nodes.forEach(node => {
      g.setNode(node.id, { label: node.payload['$type'] });
    });

    g.nodes().forEach(v => {
      const node = g.node(v);
      node.rx = node.ry = 5;
    });

    edges.forEach(edge => {
      g.setEdge(edge.from, edge.to, { label: edge.why });
    });

    // Create the renderer
    var renderD3 = new dagreD3.render();

    // Set up an SVG group so that we can translate the final graph.
    var svg = d3.select('svg'),
      svgGroup = svg.append('g');

    // Run the renderer. This is what draws the final graph.
    renderD3(d3.select('svg g'), g);

    // Center the graph
    var xCenterOffset = (svg.attr('width') - g.graph().width) / 2;
    svgGroup.attr('transform', 'translate(' + xCenterOffset + ', 20)');
    svg.attr('height', g.graph().height + 40);
  }

  render() {
    return (
      <svg id="nodeTree" ref="nodeTree" width="960" height="600">
        <g ref="nodeTreeGroup" />
      </svg>
    );
  }
}

render(<Demo />, document.querySelector('#demo'));
