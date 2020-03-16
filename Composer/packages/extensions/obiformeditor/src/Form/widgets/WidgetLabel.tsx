// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { DirectionalHint, TooltipHost, TooltipDelay } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { NeutralColors } from '@uifabric/fluent-theme';

interface DescriptionCalloutProps {
  title: string;
  description?: string;
  id?: string;
  helpLink?: string;
  helpLinkText?: string;
}

const DescriptionCallout: React.FC<DescriptionCalloutProps> = props => {
  const { description, title, id, helpLink, helpLinkText } = props;

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
            <p>
              {description}
              {helpLink && helpLinkText && (
                <>
                  <br />
                  <br />
                  <a href={helpLink} target="_blank" rel="noopener noreferrer">
                    {helpLinkText}
                  </a>
                </>
              )}
            </p>
          </div>
        ),
      }}
      delay={TooltipDelay.zero}
      directionalHint={DirectionalHint.leftCenter}
      styles={{ root: { display: 'flex', alignItems: 'center' } }}
      id={`${id}-description`}
    >
      <Icon
        iconName="Unknown"
        styles={{
          root: {
            width: '20px',
            minWidth: '20px',
            height: '20px',

            color: NeutralColors.gray160,
            fontSize: '12px',

            marginBottom: '-10px',
            marginLeft: '4px',
          },
        }}
        aria-label={
          // append a semicolon so the screen-reader pauses instead of making a confusing run-on
          `;${description}`
        }
      />
    </TooltipHost>
  );
};

interface WidgetLabelProps {
  id?: string;
  label?: string;
  description?: string;
  inline?: boolean;
  helpLink?: string;
  helpLinkText?: string;
}

export const WidgetLabel: React.FC<WidgetLabelProps> = props => {
  const { label, description, id, inline, helpLink, helpLinkText } = props;

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
      <DescriptionCallout
        description={description}
        title={label}
        id={id}
        helpLink={helpLink}
        helpLinkText={helpLinkText}
      />
    </Label>
  );
};
