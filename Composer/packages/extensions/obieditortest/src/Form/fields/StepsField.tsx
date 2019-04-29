import React from 'react';
import formatMessage from 'format-message';
import { FieldProps } from 'react-jsonschema-form';
import { PrimaryButton, DirectionalHint } from 'office-ui-fabric-react';

import { DialogGroup } from '../../schema/appschema';
import { buildDialogOptions } from '../utils';

import { TableField } from './TableField';

export const StepsField: React.FC<FieldProps> = props => {
  return (
    <TableField<MicrosoftIDialog>
      {...props}
      dialogOptionsOpts={{ exclude: [DialogGroup.RULE, DialogGroup.SELECTOR, DialogGroup.OTHER] }}
      navPrefix={props.name}
    >
      {({ createNewItemAtIndex }) => (
        <PrimaryButton
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
          {formatMessage('Add New Step')}
        </PrimaryButton>
      )}
    </TableField>
  );
};
