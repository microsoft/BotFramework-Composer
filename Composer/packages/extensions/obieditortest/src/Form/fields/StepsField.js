import React from 'react';
import formatMessage from 'format-message';

import { TableField } from './TableField';

const renderTitle = item => item.$type || 'New Step';

export function StepsField(props) {
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
