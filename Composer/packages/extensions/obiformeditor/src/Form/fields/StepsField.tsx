/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import React from 'react';
import { DialogGroup, createStepMenu, MicrosoftIDialog } from 'shared';
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
