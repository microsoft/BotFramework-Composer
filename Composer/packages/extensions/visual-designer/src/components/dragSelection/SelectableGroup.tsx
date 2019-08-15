/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useReducer, useState, useEffect, useRef, FC } from 'react';
import { SelectBox } from './SelectBox';
import { SelectableGroupContext } from './Context';

interface NodeProps {
  deselectOnEsc?: boolean;
  selectableTag: string;
  selectableNodeDataTag: string;
  onSelectionChange: (selectedNodes) => object | void;
}

const defaultState = {
  currClientX: 0,
  currClientY: 0,
  initClientX: 0,
  initClientY: 0,
};

export const SelectableGroup: FC<NodeProps> = props => {
  const divRef = useRef<HTMLDivElement>(null);
  let mousedownStarted = useRef(false);
  const [selectedItems, setSelectedItems] = useState<Element[]>([]);
  const onSelectArea = data => {
    let selected: Element[] = [];
    const items = document.querySelectorAll(`div[${props.selectableTag}]`);
    const { initClientX, currClientX, initClientY, currClientY } = data;
    if (initClientX !== currClientX || initClientY !== currClientY) {
      if (divRef.current) {
        const containerBound = divRef.current.getBoundingClientRect();
        const minX = Math.min(initClientX, currClientX) + containerBound.left;
        const minY = Math.min(initClientY, currClientY) + containerBound.top;
        const maxX = Math.max(initClientX, currClientX) + containerBound.left;
        const maxY = Math.max(initClientY, currClientY) + containerBound.top;

        if ((!minX && !minY) || (!maxX && !maxY)) return;
        if (items.length > 0) {
          for (const item of Array.from(items)) {
            const bounds = item.getBoundingClientRect();
            if (!(bounds.right < minX || bounds.bottom < minY || (bounds.left > maxX || bounds.top > maxY))) {
              // in bounds
              if (item && item['dataset'][props.selectableNodeDataTag]) {
                selected.push(item['dataset'][props.selectableNodeDataTag]);
              }
            }
          }
        }
      }
    } else {
      selected = [];
    }
    setSelectedItems(selected);
    props.onSelectionChange(selected);
  };
  const getRelativePosition = payload => {
    let { clientX, clientY } = payload;
    if (divRef.current) {
      const containerBound = divRef.current.getBoundingClientRect();
      clientX = clientX - containerBound.left;
      clientY = clientY - containerBound.top;
    }
    return { clientX, clientY };
  };
  const reducer = (state, action) => {
    const { type, payload } = action;
    const { clientX, clientY } = getRelativePosition(payload || { clientX: 0, clientY: 0 });
    switch (type) {
      case 'mouseup': {
        const { initClientX, initClientY, currClientX, currClientY } = state;
        if (initClientX && initClientY && currClientX && currClientY) {
          onSelectArea({ initClientX, initClientY, currClientX, currClientY });
        }
        return {
          ...defaultState,
        };
      }
      case 'mouseleave': {
        return { ...defaultState };
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
      default:
        throw new Error('Unsupported action dispatched in SelectableGroup');
    }
  };
  const [{ initClientX, currClientX, initClientY, currClientY, mountRenderComplete }, dispatch] = useReducer(
    reducer,
    defaultState
  );

  const mousedownHandler = e => {
    e.stopPropagation();
    const { clientX, clientY } = e;
    if (mousedownStarted.current) return;
    mousedownStarted.current = true;
    dispatch({ type: 'mousedown', payload: { clientX, clientY } });
  };

  const mousemoveHandler = e => {
    if (mousedownStarted.current) {
      const { clientX, clientY } = e;
      dispatch({ type: 'mousemove', payload: { clientX, clientY } });
    }
  };

  const mouseupHandler = () => {
    console.log('mouseup');
    mousedownStarted.current = false;
    dispatch({ type: 'mouseup' });
  };

  const mouseleaveHandler = () => {
    mousedownStarted.current = false;
    dispatch({ type: 'mouseleave' });
  };

  const keyListener = e => {
    if (e.keyCode === 27) {
      setSelectedItems([]);
      props.onSelectionChange([]);
    }
  };

  useEffect(() => {
    if (props.deselectOnEsc) {
      document.addEventListener('keydown', keyListener);
    }
  }, [initClientX, initClientY, currClientX, currClientY]);

  return (
    <SelectableGroupContext.Provider value={{ selectedItems }}>
      <div
        ref={divRef}
        css={{ position: 'relative' }}
        onMouseDown={mousedownHandler}
        onMouseMove={mousemoveHandler}
        onMouseLeave={mouseleaveHandler}
        onMouseUp={mouseupHandler}
      >
        <SelectBox xStart={initClientX} xEnd={currClientX} yStart={initClientY} yEnd={currClientY} />
        {props.children}
      </div>
    </SelectableGroupContext.Provider>
  );
};

SelectableGroup.defaultProps = {
  deselectOnEsc: true,
};
