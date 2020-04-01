// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import { arrayItem } from './styles';
var ArrayItem = function(props) {
  var children = props.children,
    hasMoveUp = props.hasMoveUp,
    hasMoveDown = props.hasMoveDown,
    hasRemove = props.hasRemove,
    onReorderClick = props.onReorderClick,
    onDropIndexClick = props.onDropIndexClick,
    index = props.index;
  // This needs to return true to dismiss the menu after a click.
  var fabricMenuItemClickHandler = function(fn) {
    return function(e) {
      fn(e);
      return true;
    };
  };
  var contextItems = [
    {
      key: 'moveUp',
      text: 'Move Up',
      iconProps: { iconName: 'CaretSolidUp' },
      disabled: !hasMoveUp,
      onClick: fabricMenuItemClickHandler(onReorderClick(index, index - 1)),
    },
    {
      key: 'moveDown',
      text: 'Move Down',
      iconProps: { iconName: 'CaretSolidDown' },
      disabled: !hasMoveDown,
      onClick: fabricMenuItemClickHandler(onReorderClick(index, index + 1)),
    },
    {
      key: 'remove',
      text: 'Remove',
      iconProps: { iconName: 'Cancel' },
      disabled: !hasRemove,
      onClick: fabricMenuItemClickHandler(onDropIndexClick(index)),
    },
  ];
  return jsx(
    'div',
    { css: arrayItem },
    children,
    jsx(IconButton, {
      menuProps: { items: contextItems },
      menuIconProps: { iconName: 'MoreVertical' },
      ariaLabel: formatMessage('Item Actions'),
      'data-testid': 'ArrayItemContextMenu',
      styles: {
        menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 },
        root: { margin: 'auto 0' },
      },
    })
  );
};
ArrayItem.defaultProps = {
  onReorderClick: function() {
    return function() {};
  },
  onDropIndexClick: function() {
    return function() {};
  },
};
export default ArrayItem;
//# sourceMappingURL=ArrayItem.js.map
