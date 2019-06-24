var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
import React from 'react';
// import PropTypes from 'prop-types';
import { OverflowSet, IconButton, Link } from 'office-ui-fabric-react';
export var IconMenu = function(_a) {
  var iconName = _a.iconName,
    iconSize = _a.iconSize,
    iconStyles = _a.iconStyles,
    label = _a.label,
    menuItems = _a.menuItems,
    menuWidth = _a.menuWidth;
  var _onRenderItem = function(item) {
    return React.createElement(Link, { styles: { root: { marginRight: 10 } }, onClick: item.onClick }, item.name);
  };
  var _onRenderOverflowButton = function(overflowItems) {
    var buttonStyles = {
      root: __assign(
        { minWidth: 0, padding: '0 4px', alignSelf: 'stretch', height: 'auto', color: '#000000' },
        iconStyles
      ),
    };
    return React.createElement(IconButton, {
      styles: buttonStyles,
      menuIconProps: { iconName: iconName, style: { fontSize: iconSize } },
      menuProps: { items: overflowItems, calloutProps: { calloutMaxWidth: menuWidth } },
      ariaLabel: label,
    });
  };
  return React.createElement(
    OverflowSet,
    // @ts-ignore
    {
      // @ts-ignore
      styles: { position: 'absolute', top: 0 },
      vertical: true,
      overflowItems: menuItems,
      onRenderOverflowButton: _onRenderOverflowButton,
      onRenderItem: _onRenderItem,
    }
  );
};
IconMenu.defaultProps = {
  iconName: 'More',
  iconSize: 16,
  iconStyles: {},
  menuItems: [],
  menuWidth: 0,
};
// IconMenu.propTypes = {
//   iconName: PropTypes.string.isRequired,
//   label: PropTypes.string,
//   menuItems: PropTypes.arrayOf(
//     PropTypes.shape({
//       key: PropTypes.string.isRequired,
//       name: PropTypes.string.isRequired,
//       onClick: PropTypes.func,
//     })
//   ).isRequired,
//   menuWidth: PropTypes.number,
// };
//# sourceMappingURL=IconMenu.js.map
