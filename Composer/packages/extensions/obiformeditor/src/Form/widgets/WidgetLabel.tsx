/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import React from 'react';
import { Label, DirectionalHint, IconButton, TooltipHost, TooltipDelay } from 'office-ui-fabric-react';
import { NeutralColors } from '@uifabric/fluent-theme';

interface DescriptionCalloutProps {
  title: string;
  description?: string;
  id?: string;
}

const DescriptionCallout: React.FC<DescriptionCalloutProps> = props => {
  const { description, title, id } = props;

  if (!description) {
    return null;
  }

  return (
    <TooltipHost
      tooltipProps={{
        styles: { root: { width: '288px', padding: '17px 28px' } },
        onRenderContent: () => (
          <div>
            <h3 style={{ fontSize: '20px', margin: '0', marginBottom: '10px' }}>{title}</h3>
            <p>{description}</p>
          </div>
        ),
      }}
      delay={TooltipDelay.zero}
      directionalHint={DirectionalHint.leftCenter}
      styles={{ root: { display: 'flex', alignItems: 'center' } }}
      id={`${id}-description`}
    >
      <IconButton
        iconProps={{
          iconName: 'Unknown',
        }}
        styles={{
          root: { width: '20px', minWidth: '20px', height: '20px' },
          rootHovered: { backgroundColor: 'transparent' },
          rootChecked: { backgroundColor: 'transparent' },
          icon: { color: NeutralColors.gray160, fontSize: '12px', marginBottom: '-2px' },
        }}
        aria-labelledby={`${id}-description`}
      />
    </TooltipHost>
  );
};

interface WidgetLabelProps {
  id?: string;
  label?: string;
  description?: string;
  inline?: boolean;
}

export const WidgetLabel: React.FC<WidgetLabelProps> = props => {
  const { label, description, id, inline } = props;

  if (!label) {
    return null;
  }

  return (
    <Label
      htmlFor={id}
      styles={{
        root: {
          fontWeight: '400',
          display: 'flex',
          alignItems: 'center',
          marginLeft: inline ? '4px' : '0',
        },
      }}
    >
      {label}
      <DescriptionCallout description={description} title={label} id={id} />
    </Label>
  );
};
