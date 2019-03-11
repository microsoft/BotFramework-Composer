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

	generateTree() {
		// Create a new directed graph
		var g = new dagreD3.graphlib.Graph().setGraph({});

		[ 'normal', 'vee', 'undirected' ].forEach(function(arrowhead) {
			g.setNode(arrowhead + '1', { label: ' ' });
			g.setNode(arrowhead + '2', { label: ' ' });
			g.setEdge(arrowhead + '1', arrowhead + '2', {
				arrowhead: arrowhead,
				label: arrowhead
			});
		});

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
	width: 400,
	height: 600,
}

// TODO: configure a babel transformer for in-class props validation.
DialogFlowEditor.propTypes = {
	// TODO: define concrete schema for obi-nodes and obi-edges.
	behaviouralNodes: PropTypes.arrayOf(PropTypes.object).isRequired,
	pipelineEdges: PropTypes.arrayOf(PropTypes.object).isRequired,
	width: PropTypes.number,
	height: PropTypes.number,
};
