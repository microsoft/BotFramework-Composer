import React, { Component } from 'react';
import { Fragment, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';

import { NodeClickActionTypes } from '../shared/NodeClickActionTypes';

import { AdaptiveDialogEditor } from './AdaptiveDialogEditor';

export class ObiEditor extends Component {
  state = {
    prevPath: '',
    focusedId: '',
    nodeRefs: {},
    selectedNodes: [],
  };

  static getDerivedStateFromProps(props, state) {
    if (props.path !== state.prevPath) {
      return {
        prevPath: props.path,
        focusedId: '',
      };
    }
    return null;
  }

  dispatchEvent(eventName, eventData) {
    const { onSelect, onExpand, onOpen } = this.props;

    let handler;
    switch (eventName) {
      case NodeClickActionTypes.Focus:
        handler = onSelect;
        break;
      case NodeClickActionTypes.Expand:
        handler = onExpand;
        break;
      case NodeClickActionTypes.OpenLink:
        handler = onOpen;
        break;
      default:
        handler = onSelect;
        break;
    }
    if (this.state.focusedId !== eventData) {
      this.setState({ focusedId: eventData });
    }
    return handler(eventData);
  }

  onSelectArea = data => {
    const selected = [];
    const { initClientX, currClientX, initClientY, currClientY } = data;
    if (!initClientX && !currClientX && !initClientY && !currClientY) return;
    for (const key in this.state.nodeRefs) {
      const current = this.state.nodeRefs[key];
      const bounds = current.getBoundingClientRect();
      if (bounds.left > initClientX && bounds.right < currClientX) {
        if (bounds.top > initClientY && bounds.bottom < currClientY) {
          // in bounds
          selected.push(key);
        }
      }
    }
    this.setState({ selectedNodes: selected });
  };

  onChange = () => {};

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.path.graphId !== this.props.path.graphId) return true;
    if (nextProps.data !== this.props.data) return true;
    if (nextState.focusedId !== this.state.focusedId) return true;
    if (nextState.selectedNodes !== this.state.selectedNodes) return true;
    return false;
  }

  render() {
    const graphId = this.props.path;

    return (
      <div
        className="obi-editor-container"
        data-testid="obi-editor-container"
        style={{ width: '100%', height: '100%' }}
      >
        <RDS onNewState={this.onSelectArea} onSelectArea={this.onSelectArea}>
          <AdaptiveDialogEditor
            key={graphId}
            id={graphId}
            data={this.props.data}
            expanded={true}
            focusedId={this.state.focusedId}
            onEvent={(...args) => this.dispatchEvent(...args)}
            nodeRefs={this.state.nodeRefs}
            selectedNodes={this.state.selectedNodes}
          />
        </RDS>
      </div>
    );
  }
}

ObiEditor.defaultProps = {
  path: '.',
  data: {},
  onSelect: () => {},
  onExpand: () => {},
  onOpen: () => {},
};

ObiEditor.propTypes = {
  path: PropTypes.string,
  // Obi raw json
  data: PropTypes.object,
  onSelect: PropTypes.func,
  onExpand: PropTypes.func,
  onOpen: PropTypes.func,
};

///////////////////
///////////////////
///////////////////
///////////////////
///////////////////
///////////////////
///////////////////

const defaultState = {
  currClientX: 0,
  currClientY: 0,
  initClientX: 0,
  initClientY: 0,
  mountRenderComplete: false,
  viewSettings: {
    backgroundColor: '#e4effe',
    border: '1px dotted #001f52',
    opacity: '0.5',
    position: 'absolute',
    zIndex: 10,
  },
};

export const RDS = props => {
  const [
    { initClientX, currClientX, initClientY, currClientY, viewSettings, mountRenderComplete },
    dispatch,
  ] = useReducer((state, { type, payload: { clientX, clientY, viewSettings } = {} }) => {
    switch (type) {
      case 'mountrendercomplete': {
        return {
          ...defaultState,
          mountRenderComplete: true,
        };
      }
      case 'mouseup': {
        const { initClientX, initClientY, currClientX, currClientY } = state;
        if (initClientX && initClientY && currClientX && currClientY) {
          if (initClientX !== currClientX || initClientY !== currClientY) {
            props.onSelectArea({ initClientX, initClientY, currClientX, currClientY });
          }
        }
        return {
          ...defaultState,
        };
      }
      case 'mousemove': {
        return {
          ...state,
          currClientX: clientX,
          currClientY: clientY,
        };
      }
      case 'mousedown': {
        return {
          ...state,
          initClientX: clientX,
          initClientY: clientY,
        };
      }
      case 'setviewoptions': {
        return {
          ...state,
          viewSettings: { ...state.viewSettings, ...viewSettings },
        };
      }
      default:
        throw new Error('Unsupported action dispatched in RDS');
    }
  }, defaultState);

  const mousedownHandler = ({ clientX, clientY }) => {
    dispatch({ type: 'mousedown', payload: { clientX, clientY } });
    window.addEventListener('mouseup', mouseupHandler);
    window.addEventListener('mousemove', mousemoveHandler);
  };

  const mousemoveHandler = ({ clientX, clientY }) => {
    dispatch({ type: 'mousemove', payload: { clientX, clientY } });
  };

  const mouseupHandler = () => {
    dispatch({ type: 'mouseup' });
    window.removeEventListener('mouseup', mouseupHandler);
    window.removeEventListener('mousemove', mousemoveHandler);
  };

  useEffect(() => {
    if (!mountRenderComplete) {
      window.addEventListener('mousedown', mousedownHandler, false);
      dispatch({ type: 'mountrendercomplete' });
    }

    props.onNewState({ initClientX, currClientX, initClientY, currClientY, viewSettings }, dispatch);
  }, [initClientX, initClientY, currClientX, currClientY]);

  return (
    <Fragment>
      <Box
        xStart={initClientX}
        xEnd={currClientX}
        yStart={initClientY}
        yEnd={currClientY}
        viewSettings={viewSettings}
      />
      {props.children}
    </Fragment>
  );
};

export const Box = props => {
  const { xStart, xEnd, yStart, yEnd, viewSettings } = props;
  if (xEnd === 0 || yEnd === 0) {
    return null;
  }

  return (
    <div
      // @ts-ignore
      style={{
        ...viewSettings,
        height: Math.abs(yEnd - yStart),
        marginLeft: Math.min(xStart, xEnd),
        marginTop: Math.min(yStart, yEnd),
        width: Math.abs(xEnd - xStart),
      }}
    />
  );
};
