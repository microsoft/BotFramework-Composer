import React from 'react';
import formatMessage from 'format-message';

import { TableField } from './TableField';

const columns = [
  {
    key: 'column2',
    name: formatMessage('# of Steps'),
    data: 'number',
    onRender: item => {
      return (item.steps || []).length;
    },
  },
];

const renderTitle = item => {
  if (!item.$type) {
    return formatMessage('New Rule');
  }

  if (item.$type.includes('Intent')) {
    return item.intent || item.$type;
  }

  return item.$type;
};

export function RulesField(props) {
  return (
    <TableField
      {...props}
      additionalColumns={columns}
      defaultItem={{ $type: 'Microsoft.NoMatchRule' }}
      filterNewOptions={item => item.includes('Rule')}
      label={formatMessage('Add New Rule')}
      navPrefix="rules"
      renderTitle={renderTitle}
    />
  );
}
