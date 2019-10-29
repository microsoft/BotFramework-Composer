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
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { IdSchema } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { Pivot, PivotLinkSize, PivotItem } from 'office-ui-fabric-react';
import get from 'lodash.get';
import { PromptTab } from 'shared';

import { BaseField } from '../BaseField';
import { BFDFieldProps } from '../../types';

import { tabs, tabsContainer, settingsContainer } from './styles';
import { BotAsks } from './BotAsks';
import { UserAnswers } from './UserAnswers';
import { Exceptions } from './Exceptions';
import { PromptSettings } from './PromptSettings';
import { GetSchema, PromptFieldChangeHandler } from './types';

export const PromptField: React.FC<BFDFieldProps> = props => {
  const { formContext } = props;
  const { shellApi, focusedTab, focusedSteps } = formContext;
  const promptSettingsIdSchema = ({ __id: props.idSchema.__id + 'promptSettings' } as unknown) as IdSchema;

  const getSchema: GetSchema = field => {
    const fieldSchema = get(props.schema, ['properties', field]);

    return fieldSchema;
  };

  const updateField: PromptFieldChangeHandler = field => data => {
    props.onChange({ ...props.formData, [field]: data });
  };

  const handleTabChange = (item?: PivotItem) => {
    if (item) {
      shellApi.onFocusSteps(focusedSteps, item.props.itemKey);
    }
  };

  return (
    <BaseField {...props}>
      <div css={tabsContainer}>
        <Pivot
          linkSize={PivotLinkSize.large}
          styles={tabs}
          selectedKey={focusedTab || PromptTab.BOT_ASKS}
          onLinkClick={handleTabChange}
        >
          <PivotItem headerText={formatMessage('Bot Asks')} itemKey={PromptTab.BOT_ASKS}>
            <BotAsks {...props} onChange={updateField} getSchema={getSchema} />
          </PivotItem>
          <PivotItem headerText={formatMessage('User Answers')} itemKey={PromptTab.USER_ANSWERS}>
            <UserAnswers {...props} onChange={updateField} getSchema={getSchema} />
          </PivotItem>
          <PivotItem headerText={formatMessage('Exceptions')} itemKey={PromptTab.EXCEPTIONS}>
            <Exceptions {...props} onChange={updateField} getSchema={getSchema} />
          </PivotItem>
        </Pivot>
      </div>

      <div className="ObjectItem ObjectItemContainer" css={settingsContainer}>
        <div className="ObjectItemField">
          <BaseField
            formContext={props.formContext}
            formData={props.formData}
            idSchema={promptSettingsIdSchema}
            title={formatMessage('Prompt settings')}
            schema={{}}
          >
            <PromptSettings {...props} onChange={updateField} getSchema={getSchema} />
          </BaseField>
        </div>
      </div>
    </BaseField>
  );
};
