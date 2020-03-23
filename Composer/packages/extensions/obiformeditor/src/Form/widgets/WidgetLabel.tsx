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
  helpLinkLabel?: string;
}

const DescriptionCallout: React.FC<DescriptionCalloutProps> = props => {
  const { description, title, id, helpLink, helpLinkText, helpLinkLabel } = props;

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
              {helpLink && helpLinkText && helpLinkLabel && (
                <>
                  <br />
                  <br />
                  <a aria-label={helpLinkLabel} href={helpLink} target="_blank" rel="noopener noreferrer">
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
      <div tabIndex={0}>
        <Icon
          iconName="Unknown"
          styles={{
            root: {
              width: '12px',
              minWidth: '12px',
              height: '12px',

              padding: '0px 3px',

              color: NeutralColors.gray160,
              fontSize: '12px',
            },
          }}
          aria-label={
            // add a semicolon so the screen-reader pauses instead of making a confusing run-on
            `;${description}`
          }
        />
      </div>
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
  helpLinkLabel?: string;
}

export const WidgetLabel: React.FC<WidgetLabelProps> = props => {
  const { label, description, id, inline, helpLink, helpLinkText, helpLinkLabel } = props;

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
        helpLinkLabel={helpLinkLabel}
        aria-label={helpLinkLabel}
      />
    </Label>
  );
};
