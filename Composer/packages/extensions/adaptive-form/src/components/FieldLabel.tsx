// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { DirectionalHint, TooltipHost, TooltipDelay } from 'office-ui-fabric-react/lib/Tooltip';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { NeutralColors } from '@uifabric/fluent-theme';

interface DescriptionCalloutProps {
  title: string;
  description?: string;
  id?: string;
}

const DescriptionCallout: React.FC<DescriptionCalloutProps> = function DescriptionCallout(props) {
  const { description, title, id } = props;

  if (!description) {
    return null;
  }

  return (
    <TooltipHost
      delay={TooltipDelay.zero}
      directionalHint={DirectionalHint.leftCenter}
      id={`${id}-description`}
      styles={{ root: { display: 'flex', alignItems: 'center' } }}
      tooltipProps={{
        styles: { root: { width: '288px', padding: '17px 28px' } },
        onRenderContent: () => (
          <div>
            <h3 style={{ fontSize: '20px', margin: '0', marginBottom: '10px' }}>{title}</h3>
            <p>{description}</p>
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
  inline?: boolean;
}

export const FieldLabel: React.FC<FieldLabelProps> = function FieldLabel(props) {
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
      <DescriptionCallout description={description} id={id} title={label} />
    </Label>
  );
};
