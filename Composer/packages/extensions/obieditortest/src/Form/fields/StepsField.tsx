import React from 'react';
import formatMessage from 'format-message';
import { FieldProps } from '@bfdesigner/react-jsonschema-form';
import { PrimaryButton, DirectionalHint } from 'office-ui-fabric-react';

import { DialogGroup } from '../../schema/appschema';
import { buildDialogOptions, setOverridesOnField } from '../utils';

import { TableField } from './TableField';

export const StepsField: React.FC<FieldProps> = props => {
  const { formContext } = props;
  const overrides = setOverridesOnField(formContext, 'StepsField');

  return (
    <TableField<MicrosoftIDialog>
      {...props}
      {...overrides}
      dialogOptionsOpts={{ exclude: [DialogGroup.RULE, DialogGroup.SELECTOR, DialogGroup.OTHER] }}
      navPrefix={props.name}
    >
      {({ createNewItemAtIndex }) => (
        <PrimaryButton
          data-testid="StepsFieldAdd"
          styles={{ root: { marginTop: '20px' } }}
          menuProps={{
            items: buildDialogOptions({
              exclude: [DialogGroup.RULE, DialogGroup.SELECTOR, DialogGroup.OTHER],
              onClick: createNewItemAtIndex(),
            }),
            calloutProps: { calloutMaxHeight: 500 },
            directionalHint: DirectionalHint.bottomLeftEdge,
          }}
          type="button"
        >
          {formatMessage('Add..')}
        </PrimaryButton>
      )}
    </TableField>
  );
};
