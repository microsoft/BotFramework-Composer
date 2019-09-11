import React from 'react';
import get from 'lodash.get';
import { FieldTemplateProps } from '@bfcomposer/react-jsonschema-form';
import { Label, DirectionalHint, IconButton } from 'office-ui-fabric-react';
import { NeutralColors } from '@uifabric/fluent-theme';
import { TooltipHost } from 'office-ui-fabric-react';
import { TooltipDelay } from 'office-ui-fabric-react';
import { JSONSchema6TypeName } from 'json-schema';
import classnames from 'classnames';

import { FIELDS_TO_HIDE } from '../schema/appschema';

interface DescriptionCalloutProps {
  title: string;
  description?: string;
  id: string;
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
            <p dangerouslySetInnerHTML={{ __html: description }} />
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

function shouldRenderLabel(type: string | JSONSchema6TypeName[] | undefined): boolean {
  if (typeof type === 'string') {
    // boolean is a special snowflake that needs to render the label inline
    return !['object', 'array'].includes(type);
  }

  return false;
}

export default function FieldTemplate(props: FieldTemplateProps) {
  const { id, children, label, rawDescription, uiSchema, schema } = props;
  const { type } = schema;

  const hidden = get(uiSchema, 'ui:widget') === 'hidden' || get(uiSchema, 'ui:field') === 'NullField';

  if (hidden || (label && FIELDS_TO_HIDE.includes(label.toLowerCase()))) {
    return null;
  }

  const isInline = type === 'boolean';
  const fieldClasses = classnames('FieldTemplate', {
    'FieldTemplate--inline': isInline,
    'FieldTemplate--reverse': isInline,
  });

  return shouldRenderLabel(type) ? (
    <div className={fieldClasses}>
      {label && (
        <Label
          htmlFor={id}
          styles={{ root: { fontWeight: '400', display: 'flex', alignItems: 'center', marginTop: '14px' } }}
        >
          {label}
          <DescriptionCallout description={rawDescription} title={label} id={id} />
        </Label>
      )}
      {children}
    </div>
  ) : (
    <>{children}</>
  );
}
