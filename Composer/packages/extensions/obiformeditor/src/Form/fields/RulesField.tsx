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
import formatMessage from 'format-message';
import { DirectionalHint, DefaultButton } from 'office-ui-fabric-react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import get from 'lodash.get';
import { createStepMenu, DialogGroup, ITriggerCondition, OnIntent } from 'shared';

import { setOverridesOnField } from '../utils';

import { TableField } from './TableField';

const renderTitle = (item: ITriggerCondition) => {
  const friendlyName = get(item, '$designer.name');

  if (friendlyName) {
    return friendlyName;
  }

  const intentName = ((item as unknown) as OnIntent).intent;
  if (intentName) {
    return intentName;
  }

  return item.$type;
};

export function RulesField(props: FieldProps) {
  const overrides = setOverridesOnField(props.formContext, 'RulesField');

  return (
    <TableField<ITriggerCondition>
      {...props}
      {...overrides}
      dialogOptionsOpts={{ include: [DialogGroup.EVENTS], subMenu: false }}
      label={formatMessage('Add New Rule')}
      navPrefix="triggers"
      renderTitle={renderTitle}
    >
      {({ createNewItemAtIndex }) => (
        <DefaultButton
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
        </DefaultButton>
      )}
    </TableField>
  );
}
