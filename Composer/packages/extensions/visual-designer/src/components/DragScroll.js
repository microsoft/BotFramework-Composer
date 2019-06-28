import React, { useRef } from 'react';

function getScrollParent(node) {
  if (!node || node === document) return null;

  const isNodeOverflow = node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth;
  // REF: https://github.com/jquery/jquery-ui/blob/master/ui/scroll-parent.js
  const isNodeScrollable = getComputedStyle(node).overflow.match(/(auto|scroll|hidden)/);

  if (isNodeOverflow && isNodeScrollable) {
    return node;
  }
  return getScrollParent(node.parentNode);
}

export default function DragScroll(props) {
  const isDragging = useRef(false);
  const dragStartPoint = useRef({ x: 0, y: 0 });

  const handleMouseDown = e => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    dragStartPoint.current.x = e.pageX;
    dragStartPoint.current.y = e.pageY;
  };

  const handleMouseUp = e => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseMove = e => {
    if (isDragging.current) {
      const mouseMove = {
        x: e.pageX - dragStartPoint.current.x,
        y: e.pageY - dragStartPoint.current.y,
      };
      const scrollParent = getScrollParent(e.currentTarget);
      if (scrollParent) {
        scrollParent.scrollBy(-mouseMove.x, -mouseMove.y);
        dragStartPoint.current.x = e.pageX;
        dragStartPoint.current.y = e.pageY;
      } else {
        window.scrollBy(-mouseMove.x, -mouseMove.y);
      }
    }
  };

  return (
    <div
      className="dragscroll"
      style={{ width: '100%', height: '100%' }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {props.children}
    </div>
  );
}
