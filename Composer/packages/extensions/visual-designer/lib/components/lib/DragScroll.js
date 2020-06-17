// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRef } from 'react';
function getScrollParent(node) {
  if (!node || node === document) return null;
  var isNodeOverflow = node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth;
  // REF: https://github.com/jquery/jquery-ui/blob/master/ui/scroll-parent.js
  var isNodeScrollable = (getComputedStyle(node).overflow || '').match(/(auto|scroll|hidden)/);
  if (isNodeOverflow && isNodeScrollable) {
    return node;
  }
  return getScrollParent(node.parentNode);
}
export default function DragScroll(props) {
  var isDragging = useRef(false);
  var dragStartPoint = useRef({ x: 0, y: 0 });
  var handleMouseDown = function (e) {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    dragStartPoint.current.x = e.pageX;
    dragStartPoint.current.y = e.pageY;
  };
  var handleMouseUp = function (e) {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = false;
  };
  var handleMouseLeave = function () {
    isDragging.current = false;
  };
  var handleMouseMove = function (e) {
    if (isDragging.current) {
      var mouseMove = {
        x: e.pageX - dragStartPoint.current.x,
        y: e.pageY - dragStartPoint.current.y,
      };
      var scrollParent = getScrollParent(e.currentTarget);
      if (scrollParent) {
        scrollParent.scrollBy(-mouseMove.x, -mouseMove.y);
        dragStartPoint.current.x = e.pageX;
        dragStartPoint.current.y = e.pageY;
      } else {
        window.scrollBy(-mouseMove.x, -mouseMove.y);
      }
    }
  };
  return jsx(
    'div',
    {
      className: 'dragscroll',
      css: { width: '100%', height: '100%' },
      onMouseDown: handleMouseDown,
      onMouseLeave: handleMouseLeave,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
    },
    props.children
  );
}
//# sourceMappingURL=DragScroll.js.map
