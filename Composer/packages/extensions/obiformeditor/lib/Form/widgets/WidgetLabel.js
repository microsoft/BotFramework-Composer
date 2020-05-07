// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { DirectionalHint, TooltipHost, TooltipDelay } from 'office-ui-fabric-react/lib/Tooltip';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { NeutralColors } from '@uifabric/fluent-theme';
var DescriptionCallout = function(props) {
  var description = props.description,
    title = props.title,
    id = props.id;
  if (!description) {
    return null;
  }
  return React.createElement(
    TooltipHost,
    {
      tooltipProps: {
        styles: { root: { width: '288px', padding: '17px 28px' } },
        onRenderContent: function() {
          return React.createElement(
            'div',
            null,
            React.createElement('h3', { style: { fontSize: '20px', margin: '0', marginBottom: '10px' } }, title),
            React.createElement('p', null, description)
          );
        },
      },
      delay: TooltipDelay.zero,
      directionalHint: DirectionalHint.leftCenter,
      styles: { root: { display: 'flex', alignItems: 'center' } },
      id: id + '-description',
    },
    React.createElement(IconButton, {
      iconProps: {
        iconName: 'Unknown',
      },
      styles: {
        root: { width: '20px', minWidth: '20px', height: '20px' },
        rootHovered: { backgroundColor: 'transparent' },
        rootChecked: { backgroundColor: 'transparent' },
        icon: { color: NeutralColors.gray160, fontSize: '12px', marginBottom: '-2px' },
      },
      'aria-labelledby': id + '-description',
    })
  );
};
export var WidgetLabel = function(props) {
  var label = props.label,
    description = props.description,
    id = props.id,
    inline = props.inline;
  if (!label) {
    return null;
  }
  return React.createElement(
    Label,
    {
      htmlFor: id,
      styles: {
        root: {
          fontWeight: '400',
          display: 'flex',
          alignItems: 'center',
          marginLeft: inline ? '4px' : '0',
        },
      },
    },
    label,
    React.createElement(DescriptionCallout, { description: description, title: label, id: id })
  );
};
//# sourceMappingURL=WidgetLabel.js.map
