import React from 'react';
import formatMessage from 'format-message';
import { FieldProps } from 'react-jsonschema-form';

import { DialogGroup } from '../../schema/appschema';

import { TableField } from './TableField';

export const StepsField: React.FC<FieldProps> = props => {
  return (
    <TableField
      {...props}
      dialogOptionsOpts={{ exclude: [DialogGroup.RULE, DialogGroup.SELECTOR, DialogGroup.OTHER] }}
      label={formatMessage('Add New Step')}
      navPrefix="steps"
    />
  );
};
