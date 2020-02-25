// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { DirectionalHint, TooltipHost, TooltipDelay } from 'office-ui-fabric-react/lib/Tooltip';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';

interface DescriptionCalloutProps {
  title: string;
  description?: string;
  id?: string;
  helpLink?: string;
}

const DescriptionCallout: React.FC<DescriptionCalloutProps> = function DescriptionCallout(props) {
  const { description, title, id, helpLink } = props;

  if (!description) {
    return null;
  }

  return (
    <TooltipHost
      delay={TooltipDelay.zero}
      directionalHint={DirectionalHint.bottomAutoEdge}
      id={`${id}-description`}
      styles={{ root: { display: 'flex', alignItems: 'center' } }}
      tooltipProps={{
        styles: { root: { width: '288px', padding: '17px 28px' } },
        onRenderContent: () => (
          <div>
            <h3 style={{ fontSize: '20px', margin: '0', marginBottom: '10px' }}>{title}</h3>
            <p>{description}</p>
            {helpLink && (
              <Link href={helpLink} target="_blank" rel="noopener noreferrer">
                {formatMessage('Learn more')}
              </Link>
            )}
          </div>
        ),
      }}
    >
      <IconButton
        aria-labelledby={`${id}-description`}
        iconProps={{
          iconName: 'Unknown',
        }}
        styles={{
          root: { width: '20px', minWidth: '20px', height: '20px' },
          rootHovered: { backgroundColor: 'transparent' },
          rootChecked: { backgroundColor: 'transparent' },
          icon: {
            color: NeutralColors.gray160,
            fontSize: '12px',
            marginBottom: '-2px',
          },
        }}
      />
    </TooltipHost>
  );
};

interface FieldLabelProps {
  id?: string;
  label?: string | false;
  description?: string;
  helpLink?: string;
  inline?: boolean;
}

const FieldLabel: React.FC<FieldLabelProps> = props => {
  const { label, description, id, inline, helpLink } = props;

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
      <DescriptionCallout description={description} id={id} title={label} helpLink={helpLink} />
    </Label>
  );
};

export { FieldLabel };
