/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useReducer, useEffect, Fragment, useState } from 'react';
import { SelectBox } from './SelectBox';

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

export const SelectableGroup = ({ onSelect, children }) => {
  const [nodeRefs, setNodeRefs] = useState<Element[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<String[]>([]);
  const [
    { initClientX, currClientX, initClientY, currClientY, viewSettings, mountRenderComplete },
    dispatch,
  ] = useReducer((state, { type, payload: { clientX, clientY, viewSettings } }) => {
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
            onSelectArea({ initClientX, initClientY, currClientX, currClientY });
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

    onSelectArea({ initClientX, currClientX, initClientY, currClientY, viewSettings }, dispatch);
  }, [initClientX, initClientY, currClientX, currClientY]);

  const onSelectArea = data => {
    const selected: string[] = [];
    const { initClientX, currClientX, initClientY, currClientY } = data;
    const bottomUp = initClientY > currClientY ? true : false;
    const minX = Math.min(initClientX, currClientX);
    const minY = Math.min(initClientY, currClientY);
    const maxX = Math.max(initClientX, currClientX);
    const maxY = Math.max(initClientY, currClientY);

    if ((!minX && !minY) || (!maxX && !maxY)) return;
    for (const key in nodeRefs) {
      const current = nodeRefs[key];
      const bounds = current.getBoundingClientRect();
      if (bounds.left > minX && bounds.right < maxX) {
        if (bounds.top > (bottomUp ? minY + 20 : minY) && bounds.bottom < (bottomUp ? maxY : maxY + 20)) {
          // TODO: need to calculate
          // in bounds
          selected.push(key);
        }
      }
    }
    setSelectedNodes(selected);
  };

  return (
    <Fragment>
      <SelectBox xStart={initClientX} xEnd={currClientX} yStart={initClientY} yEnd={currClientY} css={viewSettings} />
      {children}
    </Fragment>
  );
};
