// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { DialogGroup, createStepMenu, MicrosoftIDialog } from '@bfc/shared';
import formatMessage from 'format-message';
import { DefaultButton, DirectionalHint } from 'office-ui-fabric-react';

import { setOverridesOnField } from '../utils';
import { BFDFieldProps } from '../types';

import { TableField } from './TableField';

export const StepsField: React.FC<BFDFieldProps> = props => {
  const { formContext } = props;
  const overrides = setOverridesOnField(formContext, 'StepsField');

  if (formContext.isRoot) {
    return null;
  }

  return (
    <TableField<MicrosoftIDialog>
      {...props}
      {...overrides}
      dialogOptionsOpts={{
        exclude: [DialogGroup.EVENTS, DialogGroup.ADVANCED_EVENTS, DialogGroup.SELECTOR, DialogGroup.OTHER],
      }}
      navPrefix={props.name}
    >
      {({ createNewItemAtIndex }) => (
        <DefaultButton
          data-testid="StepsFieldAdd"
          styles={{ root: { marginTop: '20px' } }}
          menuProps={{
            items: createStepMenu(
              [
                DialogGroup.RESPONSE,
                DialogGroup.INPUT,
                DialogGroup.BRANCHING,
                DialogGroup.STEP,
                DialogGroup.MEMORY,
                DialogGroup.CODE,
                DialogGroup.LOG,
              ],
              true,
              createNewItemAtIndex()
            ),
            calloutProps: { calloutMaxHeight: 500 },
            directionalHint: DirectionalHint.bottomLeftEdge,
          }}
          type="button"
        >
          {formatMessage('Add')}
        </DefaultButton>
      )}
    </TableField>
  );
};
