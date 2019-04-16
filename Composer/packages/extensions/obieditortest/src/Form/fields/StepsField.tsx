import React from 'react';
import formatMessage from 'format-message';

import { TableField } from './TableField';
import { FieldProps } from 'react-jsonschema-form';

const renderTitle = item => item.$type || formatMessage('New Step');

export function StepsField(props: FieldProps) {
  return (
    <TableField
      {...props}
      defaultItem={{ $type: 'Microsoft.SendActivity' }}
      filterNewOptions={item => !item.includes('Rule')}
      label={formatMessage('Add New Step')}
      navPrefix="steps"
      renderTitle={renderTitle}
    />
  );
}
