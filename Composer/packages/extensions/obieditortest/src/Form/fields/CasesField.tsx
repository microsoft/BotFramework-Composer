import React from 'react';
import formatMessage from 'format-message';
import { FieldProps } from 'react-jsonschema-form';
import { IColumn } from 'office-ui-fabric-react';

import { TableField } from './TableField';

const renderTitle = (item): string => {
  return Object.keys(item)[0];
};

const columns: IColumn[] = [
  {
    key: 'column2',
    name: formatMessage('# of Steps'),
    data: 'number',
    minWidth: 0,
    onRender: item => {
      // @ts-ignore
      return Object.values(item)[0].length;
    },
  },
];

export const CasesField: React.FC<FieldProps> = props => {
  return (
    <TableField
      {...props}
      additionalColumns={columns}
      columnHeader={formatMessage('Case')}
      dialogOptionsOpts={{ include: [] }}
      label={formatMessage('Add New Case')}
      navPrefix="cases"
      renderTitle={renderTitle}
    />
  );
};
