// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { DirectionalHint, TooltipHost, TooltipDelay } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { NeutralColors } from '@uifabric/fluent-theme';
var DescriptionCallout = function(props) {
  var description = props.description,
    title = props.title,
    id = props.id,
    helpLink = props.helpLink,
    helpLinkText = props.helpLinkText,
    helpLinkLabel = props.helpLinkLabel;
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
            React.createElement(
              'p',
              null,
              description,
              helpLink &&
                helpLinkText &&
                helpLinkLabel &&
                React.createElement(
                  React.Fragment,
                  null,
                  React.createElement('br', null),
                  React.createElement('br', null),
                  React.createElement(
                    'a',
                    { 'aria-label': helpLinkLabel, href: helpLink, target: '_blank', rel: 'noopener noreferrer' },
                    helpLinkText
                  )
                )
            )
          );
        },
      },
      delay: TooltipDelay.zero,
      directionalHint: DirectionalHint.leftCenter,
      styles: { root: { display: 'flex', alignItems: 'center' } },
      id: id + '-description',
    },
    React.createElement(
      'div',
      { tabIndex: 0 },
      React.createElement(Icon, {
        iconName: 'Unknown',
        styles: {
          root: {
            width: '12px',
            minWidth: '12px',
            height: '12px',
            padding: '0px 3px',
            color: NeutralColors.gray160,
            fontSize: '12px',
          },
        },
        'aria-label':
          // add a semicolon so the screen-reader pauses instead of making a confusing run-on
          ';' + description,
      })
    )
  );
};
export var WidgetLabel = function(props) {
  var label = props.label,
    description = props.description,
    id = props.id,
    inline = props.inline,
    helpLink = props.helpLink,
    helpLinkText = props.helpLinkText,
    helpLinkLabel = props.helpLinkLabel;
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
    React.createElement(DescriptionCallout, {
      description: description,
      title: label,
      id: id,
      helpLink: helpLink,
      helpLinkText: helpLinkText,
      helpLinkLabel: helpLinkLabel,
      'aria-label': helpLinkLabel,
    })
  );
};
//# sourceMappingURL=WidgetLabel.js.map
