// TODO
import React, { Component } from 'react';

import getBoundsForNode from './getBoundsForNode';
import SelectableGroupContext from './Context';

const createSelectable = WrappedComponent =>
  class SelectableItem extends Component {
    static contextType = SelectableGroupContext;

    static defaultProps = {
      selected: false,
    };

    state = {
      selected: this.props.selected,
      selecting: false,
    };

    componentDidMount() {
      this.registerSelectable();
    }

    componentWillUnmount() {
      this.context.selectable.unregister(this);
    }

    registerSelectable = containerScroll => {
      this.bounds = getBoundsForNode(this.node, containerScroll);
      this.context.selectable.register(this);
    };

    selectableRef = ref => (this.node = ref);

    render() {
      return (
        <WrappedComponent
          {...this.props}
          selected={this.state.selected}
          selecting={this.state.selecting}
          selectableRef={this.selectableRef}
        />
      );
    }
  };

export default createSelectable;
