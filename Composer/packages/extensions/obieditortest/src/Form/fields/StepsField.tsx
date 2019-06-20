import React from 'react';
import { DialogGroup, createStepMenu } from 'shared-menus';
import formatMessage from 'format-message';
import { FieldProps } from '@bfdesigner/react-jsonschema-form';
import { PrimaryButton, DirectionalHint } from 'office-ui-fabric-react';

import { setOverridesOnField } from '../utils';

import { TableField } from './TableField';

export const StepsField: React.FC<FieldProps> = props => {
  const { formContext } = props;
  const overrides = setOverridesOnField(formContext, 'StepsField');

  return (
    <TableField<MicrosoftIDialog>
      {...props}
      {...overrides}
      dialogOptionsOpts={{ exclude: [DialogGroup.EVENTS, DialogGroup.SELECTOR, DialogGroup.OTHER] }}
      navPrefix={props.name}
    >
      {({ createNewItemAtIndex }) => (
        <PrimaryButton
          data-testid="StepsFieldAdd"
          styles={{ root: { marginTop: '20px' } }}
          menuProps={{
            items: createStepMenu(
              [DialogGroup.RESPONSE, DialogGroup.INPUT, DialogGroup.STEP, DialogGroup.CODE, DialogGroup.LOG],
              true,
              createNewItemAtIndex()
            ),
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
};
