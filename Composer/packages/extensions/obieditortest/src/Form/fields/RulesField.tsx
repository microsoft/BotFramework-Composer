import React from 'react';
import formatMessage from 'format-message';
import { IColumn } from 'office-ui-fabric-react';
import { FieldProps } from 'react-jsonschema-form';
import get from 'lodash.get';

import { DialogGroup } from '../../schema/appschema';

import { TableField } from './TableField';

const columns: IColumn[] = [
  {
    key: 'column2',
    name: formatMessage('# of Steps'),
    data: 'number',
    minWidth: 50,
    isCollapsable: true,
    onRender: item => {
      return (item.steps || []).length;
    },
  },
];

const renderTitle = item => {
  const friendlyName = get(item, '$designer.friendlyName');

  if (friendlyName) {
    return friendlyName;
  }

  const intentName = item.intent;
  if (intentName) {
    return intentName;
  }

  return item.$type;
};

export function RulesField(props: FieldProps) {
  return (
    <TableField<MicrosoftIRule>
      {...props}
      additionalColumns={columns}
      dialogOptionsOpts={{ include: [DialogGroup.RULE], subMenu: false }}
      label={formatMessage('Add New Rule')}
      navPrefix="rules"
      renderTitle={renderTitle}
    />
  );
}
