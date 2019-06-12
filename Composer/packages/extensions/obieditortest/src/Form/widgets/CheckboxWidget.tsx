import React from 'react';
import { Checkbox } from 'office-ui-fabric-react';
import { WidgetProps } from '@bfdesigner/react-jsonschema-form';
import { NeutralColors } from '@uifabric/fluent-theme';

export function CheckboxWidget(props: WidgetProps) {
  const { label, onChange, onBlur, onFocus, value, schema, ...rest } = props;
  const { description } = schema;

  return (
    <>
      <Checkbox
        {...rest}
        checked={Boolean(value)}
        onChange={(_, checked?: boolean) => onChange(checked)}
        onBlur={() => onBlur(rest.id, Boolean(value))}
        onFocus={() => onFocus(rest.id, Boolean(value))}
        label={label}
      />
      {description && (
        <span style={{ fontSize: '14px' }}>
          <span style={{ margin: 0, color: NeutralColors.gray130, fontSize: '11px' }}>{description}</span>
        </span>
      )}
    </>
  );
}
