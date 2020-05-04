// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { DirectionalHint, TooltipHost, TooltipDelay } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
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
  const { description, title, helpLink } = props;

  if (!description) {
    return null;
  }

  return (
    <TooltipHost
      delay={TooltipDelay.zero}
      directionalHint={DirectionalHint.bottomAutoEdge}
      styles={{ root: { display: 'inline-block' } }}
      tooltipProps={{
        styles: { root: { width: '288px', padding: '17px 28px' } },
        onRenderContent: () => (
          <div>
            <h3 style={{ fontSize: '20px', margin: '0', marginBottom: '10px' }} aria-label={title + '.'}>
              {title}
            </h3>
            <p>{description}</p>
            {helpLink && (
              <Link
                href={helpLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={formatMessage('Learn more about {title}', { title: title.toLowerCase() })}
              >
                {formatMessage('Learn more')}
              </Link>
            )}
          </div>
        ),
      }}
    >
      <div tabIndex={0}>
        <Icon
          aria-label={title + '; ' + description}
          iconName={'Unknown'}
          styles={{
            root: {
              width: '16px',
              minWidth: '16px',
              height: '16px',
              color: NeutralColors.gray160,
              fontSize: '12px',
              marginBottom: '-2px',
              paddingLeft: '4px',
              paddingTop: '4px',
            },
          }}
        />
      </div>
    </TooltipHost>
  );
};

interface FieldLabelProps {
  id?: string;
  label?: string | false;
  description?: string;
  helpLink?: string;
  inline?: boolean;
  required?: boolean;
}

const FieldLabel: React.FC<FieldLabelProps> = (props) => {
  const { label, description, id, inline, helpLink, required } = props;

  if (!label) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Label
        htmlFor={id}
        required={required}
        styles={{
          root: {
            fontWeight: '400',
            marginLeft: inline ? '4px' : '0',
            selectors: {
              '::after': {
                paddingRight: 0,
              },
            },
          },
        }}
      >
        {label}
      </Label>
      <DescriptionCallout description={description} id={id} title={label} helpLink={helpLink} />
    </div>
  );
};

export { FieldLabel };
