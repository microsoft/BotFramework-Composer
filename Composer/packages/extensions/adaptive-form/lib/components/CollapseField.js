'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.CollapseField = void 0;
var tslib_1 = require('tslib');
/** @jsx jsx */
var core_1 = require('@emotion/core');
var react_1 = require('react');
var Styling_1 = require('office-ui-fabric-react/lib/Styling');
var Button_1 = require('office-ui-fabric-react/lib/Button');
var Label_1 = require('office-ui-fabric-react/lib/Label');
var Separator_1 = require('office-ui-fabric-react/lib/Separator');
var fluent_theme_1 = require('@uifabric/fluent-theme');
var format_message_1 = tslib_1.__importDefault(require('format-message'));
var styles = {
  transition: core_1.css(
    templateObject_1 ||
      (templateObject_1 = tslib_1.__makeTemplateObject(
        ['\n    transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1);\n    overflow: hidden;\n  '],
        ['\n    transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1);\n    overflow: hidden;\n  ']
      ))
  ),
  header: core_1.css(
    templateObject_2 ||
      (templateObject_2 = tslib_1.__makeTemplateObject(
        ['\n    display: flex;\n    margin: 0 8px;\n    align-items: center;\n  '],
        ['\n    display: flex;\n    margin: 0 8px;\n    align-items: center;\n  ']
      ))
  ),
};
exports.CollapseField = function (_a) {
  var children = _a.children,
    defaultCollapsed = _a.defaultCollapsed,
    label = _a.label;
  var _b = react_1.useState(!!defaultCollapsed),
    isOpen = _b[0],
    setIsOpen = _b[1];
  return core_1.jsx(
    react_1.Fragment,
    null,
    core_1.jsx(
      'div',
      {
        'data-is-focusable': true,
        'aria-expanded': isOpen,
        'aria-label': typeof label === 'string' ? label : format_message_1.default('Field Set'),
        css: styles.header,
        role: 'presentation',
        onClick: function () {
          setIsOpen(!isOpen);
        },
      },
      core_1.jsx(Button_1.IconButton, {
        iconProps: { iconName: isOpen ? 'ChevronDown' : 'ChevronRight' },
        styles: { root: { color: fluent_theme_1.NeutralColors.gray150 } },
      }),
      label && core_1.jsx(Label_1.Label, { styles: { root: { fontWeight: Styling_1.FontWeights.semibold } } }, label)
    ),
    core_1.jsx(Separator_1.Separator, { styles: { root: { height: 0 } } }),
    core_1.jsx('div', null, core_1.jsx(CollapseContent, { isOpen: isOpen }, children))
  );
};
var COLLAPSED = 'collapsed';
var COLLAPSING = 'collapsing';
var EXPANDING = 'expanding';
var EXPANDED = 'expanded';
var CollapseContent = function (_a) {
  var className = _a.className,
    children = _a.children,
    collapseHeight = _a.collapseHeight,
    isOpen = _a.isOpen,
    layoutEffect = _a.layoutEffect,
    render = _a.render,
    transition = _a.transition,
    onChange = _a.onChange,
    onInit = _a.onInit,
    attrs = tslib_1.__rest(_a, [
      'className',
      'children',
      'collapseHeight',
      'isOpen',
      'layoutEffect',
      'render',
      'transition',
      'onChange',
      'onInit',
    ]);
  var contentRef = react_1.useRef(null);
  var _b = react_1.useState(isOpen ? EXPANDED : COLLAPSED),
    collapseState = _b[0],
    setCollapseState = _b[1];
  var _c = react_1.useState({
      height: isOpen ? null : getCollapseHeight(),
      visibility: isOpen ? null : getCollapsedVisibility(),
    }),
    collapseStyle = _c[0],
    setCollapseStyle = _c[1];
  var _d = react_1.useState(false),
    hasReversed = _d[0],
    setHasReversed = _d[1];
  var firstUpdate = react_1.useRef(true);
  var effect = layoutEffect ? react_1.useLayoutEffect : react_1.useEffect;
  effect(
    function () {
      if (!contentRef.current) return;
      if (firstUpdate.current) {
        onCallback(onInit);
        // Don't run effect on first render, the DOM styles are already correctly set
        firstUpdate.current = false;
        return;
      }
      switch (collapseState) {
        case EXPANDING:
          setExpanding();
          break;
        case COLLAPSING:
          setCollapsing();
          break;
        case EXPANDED:
          setExpanded();
          break;
        case COLLAPSED:
          setCollapsed();
          break;
        // no default
      }
    },
    [collapseState]
  );
  function onCallback(callback) {
    if (typeof callback === 'function') {
      callback({
        collapseState: collapseState,
        collapseStyle: collapseStyle,
        hasReversed: hasReversed,
        isMoving: isMoving(collapseState),
      });
    }
  }
  function getCollapseHeight() {
    return collapseHeight || '0px';
  }
  function getCollapsedVisibility() {
    return collapseHeight ? '' : 'hidden';
  }
  function setCollapsed() {
    if (!contentRef.current) return;
    setCollapseStyle({
      height: getCollapseHeight(),
      visibility: getCollapsedVisibility(),
    });
    onCallback(onChange);
  }
  function setCollapsing() {
    if (!contentRef.current) return;
    var height = getContentHeight(); // capture height before setting it to async setState method
    setCollapseStyle({
      height: height,
      visibility: '',
    });
    nextFrame(function () {
      setCollapseStyle({
        height: getCollapseHeight(),
        visibility: '',
      });
      onCallback(onChange);
    });
  }
  function setExpanding() {
    nextFrame(function () {
      if (contentRef.current) {
        var height = getContentHeight(); // capture height before setting it to async setState method
        setCollapseStyle({
          height: height,
          visibility: '',
        });
        onCallback(onChange);
      }
    });
  }
  function setExpanded() {
    if (!contentRef.current) return;
    setCollapseStyle({
      height: '',
      visibility: '',
    });
    onCallback(onChange);
  }
  function getContentHeight() {
    var _a;
    return ((_a = contentRef.current) === null || _a === void 0 ? void 0 : _a.scrollHeight) + 'px';
  }
  function onTransitionEnd(_a) {
    var target = _a.target,
      propertyName = _a.propertyName;
    if (target === contentRef.current && propertyName === 'height') {
      switch (collapseState) {
        case EXPANDING:
          setCollapseState(EXPANDED);
          break;
        case COLLAPSING:
          setCollapseState(COLLAPSED);
          break;
        // no default
      }
    }
  }
  // getDerivedStateFromProps
  var didOpen = collapseState === EXPANDED || collapseState === EXPANDING;
  if (!didOpen && isOpen) {
    setHasReversed(collapseState === COLLAPSING);
    setCollapseState(EXPANDING);
  }
  if (didOpen && !isOpen) {
    setHasReversed(collapseState === EXPANDING);
    setCollapseState(COLLAPSING);
  }
  // END getDerivedStateFromProps
  var style = tslib_1.__assign({ transition: transition }, collapseStyle);
  return core_1.jsx(
    'div',
    tslib_1.__assign(
      { ref: contentRef, className: className, css: styles.transition, style: style, onTransitionEnd: onTransitionEnd },
      attrs
    ),
    typeof render === 'function' ? render(collapseState) : children
  );
};
function nextFrame(callback) {
  // Ensure it is always visible on collapsing, afterFrame didn't work
  requestAnimationFrame(function () {
    return requestAnimationFrame(callback);
  });
}
function isMoving(collapseState) {
  return collapseState === EXPANDING || collapseState === COLLAPSING;
}
var templateObject_1, templateObject_2;
//# sourceMappingURL=CollapseField.js.map
