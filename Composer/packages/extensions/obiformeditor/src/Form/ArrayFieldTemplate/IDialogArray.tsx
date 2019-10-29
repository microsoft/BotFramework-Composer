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
import { PrimaryButton } from 'office-ui-fabric-react';
import { ArrayFieldTemplateProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { createStepMenu, DialogGroup } from 'shared';

import ArrayItem from './ArrayItem';

const IDialogArray: React.FunctionComponent<ArrayFieldTemplateProps> = props => {
  const { items, canAdd, onAddClick, TitleField, DescriptionField } = props;

  return (
    <div className="ArrayContainer">
      <TitleField title={props.title} id={`${props.idSchema.__id}__title`} required={props.required} />
      <DescriptionField description={props.schema.description} id={`${props.idSchema.__id}__description`} />
      {items.map((element, idx) => (
        <ArrayItem {...element} key={idx} />
      ))}
      {canAdd && (
        <PrimaryButton
          type="button"
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
              onAddClick
            ),
            // items: buildDialogOptions({
            //   filter: item => !item.includes('Rule'),
            //   onClick: (e, item) => onAddClick(e, item.data),
            // }),
            onItemClick: (e, item) => {
              const newItem = item && item.data;

              if (newItem) {
                onAddClick(e, newItem);
              }
            },
          }}
          data-testid="ArrayContainerAdd"
        >
          {formatMessage('Add')}
        </PrimaryButton>
      )}
    </div>
  );
};

IDialogArray.defaultProps = {
  formData: [],
  items: [],
  onAddClick: () => {},
};

export default IDialogArray;
