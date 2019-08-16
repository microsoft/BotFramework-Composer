/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useReducer, useState, useEffect, useRef, FC } from 'react';
import { SelectBox } from './SelectBox';
import { SelectableGroupContext } from './Context';

interface NodeProps {
  selectableTag: string;
  selectableNodeDataTag: string;
  styles?: object;
  onSelectionChange: (selectedNodes) => object | void;
}

const defaultState = {
  currClientX: 0,
  currClientY: 0,
  initClientX: 0,
  initClientY: 0,
};

const threshold = 5;

export const SelectableGroup: FC<NodeProps> = props => {
  const divRef = useRef<HTMLDivElement>(null);
  let mousedownStarted = useRef(false);
  let selectedItems: Element[] = [];
  const [isDrawBox, setIsDrawBox] = useState(false);
  const [initClientX, setInitClientX] = useState(0);
  const [initClientY, setInitClientY] = useState(0);
  const [currClientX, setCurrClientX] = useState(0);
  const [currClientY, setCurrClientY] = useState(0);
  const onSelectArea = data => {
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
                selectedItems.push(item['dataset'][props.selectableNodeDataTag]);
              }
            }
          }
        }
      }
    } else {
      selectedItems = [];
    }
    props.onSelectionChange(selectedItems);
  };
  const getRelativePosition = (action, payload?) => {
    let { clientX, clientY } = payload || { clientX: 0, clientY: 0 };
    if (divRef.current) {
      const containerBound = divRef.current.getBoundingClientRect();
      clientX = clientX - containerBound.left;
      clientY = clientY - containerBound.top;
    }

    switch (action) {
      case 'mousedown':
        setInitClientX(clientX);
        setInitClientY(clientY);
        break;
      case 'mousemove':
        setCurrClientX(clientX);
        setCurrClientY(clientY);
        break;
      default:
        setInitClientX(0);
        setInitClientY(0);
        setCurrClientX(0);
        setCurrClientY(0);
        break;
    }
  };

  const mousedownHandler = e => {
    e.stopPropagation();
    const { clientX, clientY } = e;
    if (mousedownStarted.current) return;
    mousedownStarted.current = true;
    getRelativePosition('mousedown', { clientX, clientY });
  };

  const mousemoveHandler = e => {
    if (mousedownStarted.current) {
      const { clientX, clientY } = e;
      getRelativePosition('mousemove', { clientX, clientY });
    }
  };

  const mouseupHandler = () => {
    console.log('mouseup');
    mousedownStarted.current = false;
    if (initClientX && initClientY && currClientX && currClientY) {
      onSelectArea({ initClientX, initClientY, currClientX, currClientY });
    }
    getRelativePosition('mouseup');
  };

  const mouseleaveHandler = () => {
    mousedownStarted.current = false;
    getRelativePosition('mouseleave');
  };

  useEffect(() => {
    const diffX = Math.abs(initClientX - currClientX);
    const diffY = Math.abs(initClientY - currClientY);
    if (diffX > threshold && diffY > threshold) {
      setIsDrawBox(true);
    } else {
      setIsDrawBox(false);
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
        {isDrawBox ? (
          <SelectBox
            xStart={initClientX}
            xEnd={currClientX}
            yStart={initClientY}
            yEnd={currClientY}
            styles={props.styles}
          />
        ) : null}
        {props.children}
      </div>
    </SelectableGroupContext.Provider>
  );
};
