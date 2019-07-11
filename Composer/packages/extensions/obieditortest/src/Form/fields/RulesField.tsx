import React from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DirectionalHint } from 'office-ui-fabric-react';
import { FieldProps } from '@bfdesigner/react-jsonschema-form';
import get from 'lodash.get';
import { createStepMenu, DialogGroup } from 'shared-menus';

import { setOverridesOnField } from '../utils';

import { TableField } from './TableField';

const renderTitle = (item: MicrosoftIRule) => {
  const friendlyName = get(item, '$designer.name');

  if (friendlyName) {
    return friendlyName;
  }

  const intentName = (item as IntentRule).intent;
  if (intentName) {
    return intentName;
  }

  return item.$type;
};

export function RulesField(props: FieldProps) {
  const overrides = setOverridesOnField(props.formContext, 'RulesField');

  return (
    <TableField<MicrosoftIRule>
      {...props}
      {...overrides}
      dialogOptionsOpts={{ include: [DialogGroup.EVENTS], subMenu: false }}
      label={formatMessage('Add New Rule')}
      navPrefix="rules"
      renderTitle={renderTitle}
    >
      {({ createNewItemAtIndex }) => (
        <PrimaryButton
          data-testid="RulesFieldAdd"
          styles={{ root: { marginTop: '20px' } }}
          menuProps={{
            items: createStepMenu([DialogGroup.EVENTS], false, createNewItemAtIndex()),
            calloutProps: { calloutMaxHeight: 500 },
            directionalHint: DirectionalHint.bottomLeftEdge,
          }}
          type="button"
        >
          {formatMessage('Add')}
        </PrimaryButton>
      )}
    </TableField>
  );
}
