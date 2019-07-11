import React from 'react';
import { DialogGroup, createStepMenu } from 'shared-menus';
import formatMessage from 'format-message';
import { FieldProps } from '@bfdesigner/react-jsonschema-form';
import { PrimaryButton, DirectionalHint } from 'office-ui-fabric-react';
import get from 'lodash.get';

import { setOverridesOnField } from '../utils';

import { TableField } from './TableField';

export const StepsField: React.FC<FieldProps> = props => {
  const { formContext } = props;
  const overrides = setOverridesOnField(formContext, 'StepsField');
  const fieldOverrides = get(formContext.editorSchema, `content.SDKOverrides`);

  // map SDK names to nicer labes from the editor schema
  if (props && props.formData && props.formData.length) {
    for (let i = 0; i < props.formData.length; i++) {
      if (fieldOverrides[props.formData[i].$type] && fieldOverrides[props.formData[i].$type].title) {
        if (!props.formData[i].$designer) {
          props.formData[i].$designer = {};
        }
        if (!props.formData[i].$designer.name) {
          props.formData[i].$designer.name = fieldOverrides[props.formData[i].$type].title;
        }
      }
    }
  }

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
              [
                DialogGroup.RESPONSE,
                DialogGroup.INPUT,
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
        </PrimaryButton>
      )}
    </TableField>
  );
};
