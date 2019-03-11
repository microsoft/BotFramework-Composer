import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dagreD3 from 'dagre-d3';
import * as d3 from 'd3'

export class DialogFlowEditor extends Component {
    componentDidUpdate() {
        this.generateTree();
    }

	componentDidMount() {
        this.generateTree();
    }

	render() {
		return (
			<svg className='dagre-d3' width={this.props.width} height={this.props.height}>
				<g />
			</svg>
        );
	}

	setDialogNode(dagreGraph, node) {
		dagreGraph.setNode(
			node.id,
			{ label: node.name }
		);
	}

	setPipelineEdge(dagreGraph, edge) {
		dagreGraph.setEdge(
			edge.from,
			edge.to,
			{
				arrowhead: edge.arrowhead,
				label: edge.name,
			}
		);
	}

	generateTree() {
		// Create a new directed graph
		var g = new dagreD3.graphlib.Graph().setGraph({});

		for (const node of this.props.behaviouralNodes) {
			this.setDialogNode(g, node);
		}

		for (const edge of this.props.pipelineEdges) {
			this.setPipelineEdge(g, edge);
		}

		var svg = d3.select('svg'),
			inner = svg.select('g');

		// Set up zoom support
		var zoom = d3.zoom().on('zoom', function() {
			inner.attr('transform', d3.event.transform);
		});
		svg.call(zoom);

		// Create the renderer
		var render = new dagreD3.render();

		// Run the renderer. This is what draws the final graph.
		render(inner, g);

		// Center the graph
		var initialScale = 0.75;
		svg.call(
			zoom.transform,
			d3.zoomIdentity.translate((svg.attr('width') - g.graph().width * initialScale) / 2, 20).scale(initialScale)
		);

		// svg.attr('height', this.props.height);
	}
}

DialogFlowEditor.defaultProps = {
	behaviouralNodes: [],
	pipelineEdges: [],
	width: 400,
	height: 600,
}

// TODO: configure a babel transformer for in-class props validation.
DialogFlowEditor.propTypes = {
	// TODO: define concrete schema for obi-nodes and obi-edges. (JSX required)
	behaviouralNodes: PropTypes.arrayOf(PropTypes.object).isRequired,
	pipelineEdges: PropTypes.arrayOf(PropTypes.object).isRequired,
	width: PropTypes.number,
	height: PropTypes.number,
};
