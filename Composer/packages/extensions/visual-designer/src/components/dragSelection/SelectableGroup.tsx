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

const threshold = 5;

interface MousePosition {
  x: number;
  y: number;
}
export const SelectableGroup: FC<NodeProps> = props => {
  const divRef = useRef<HTMLDivElement>(null);
  const mousedownStarted = useRef(false);
  let selectedItems: string[] = [];
  const [isDrawBox, setIsDrawBox] = useState(false);
  const [initPosition, setInitPosition] = useState({ x: 0, y: 0 });
  const [currPosition, setCurrPosition] = useState({ x: 0, y: 0 });
  const onSelectArea = data => {
    const items: NodeListOf<HTMLElement> = document.querySelectorAll(`div[${props.selectableTag}]`);
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
              if (item && item.dataset[props.selectableNodeDataTag]) {
                selectedItems.push(item.dataset[props.selectableNodeDataTag] as string);
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
        setInitPosition({ x: clientX, y: clientY });
        break;
      case 'mousemove':
        setCurrPosition({ x: clientX, y: clientY });
        break;
      default:
        setInitPosition({ x: 0, y: 0 });
        setCurrPosition({ x: 0, y: 0 });
        break;
    }
  };

  const mousedownHandler = e => {
    e.preventDefault();
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

  const mouseupHandler = e => {
    e.preventDefault();
    e.stopPropagation();
    mousedownStarted.current = false;
    if (initPosition.x && initPosition.y && currPosition.x && currPosition.y) {
      onSelectArea({
        initClientX: initPosition.x,
        initClientY: initPosition.y,
        currClientX: currPosition.x,
        currClientY: currPosition.y,
      });
    }
    getRelativePosition('mouseup');
  };

  const mouseleaveHandler = e => {
    e.preventDefault();
    e.stopPropagation();
    mousedownStarted.current = false;
    getRelativePosition('mouseleave');
  };

  useEffect(() => {
    const diffX = Math.abs(initPosition.x - currPosition.x);
    const diffY = Math.abs(initPosition.y - currPosition.y);
    if (diffX > threshold && diffY > threshold) {
      setIsDrawBox(true);
    } else {
      setIsDrawBox(false);
    }
  });

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
            xStart={initPosition.x}
            yStart={initPosition.y}
            xEnd={currPosition.x}
            yEnd={currPosition.y}
            styles={props.styles}
          />
        ) : null}
        {props.children}
      </div>
    </SelectableGroupContext.Provider>
  );
};
