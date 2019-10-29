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
import { startCase, get } from 'lodash';
import React from 'react';
import { FontClassNames, FontWeights } from '@uifabric/styling';
import classnames from 'classnames';
import { JSONSchema6 } from 'json-schema';
import { FontSizes } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';

import { FormContext } from '../types';

import { EditableField } from './EditableField';

const overrideDefaults = {
  title: undefined,
  description: undefined,
  helpLink: undefined,
  helpLinkText: undefined,
};

interface RootFieldProps {
  description?: string;
  formContext: FormContext;
  formData: any;
  id: string;
  name?: string;
  onChange?: (data: any) => void;
  schema: JSONSchema6;
  title?: string;
}

export const RootField: React.FC<RootFieldProps> = props => {
  const { title, name, description, schema, formData, formContext } = props;
  const { currentDialog, editorSchema, isRoot } = formContext;

  const sdkOverrides = get(editorSchema, ['content', 'SDKOverrides', formData.$type], overrideDefaults);

  const handleTitleChange = (e: any, newTitle?: string): void => {
    if (props.onChange) {
      props.onChange({ ...formData, $designer: { ...formData.$designer, name: newTitle } });
    }
  };

  const getTitle = (): string => {
    const dialogName = isRoot && currentDialog.displayName;
    const designerName = formData && formData.$designer && formData.$designer.name;

    return designerName || dialogName || sdkOverrides.title || title || schema.title || startCase(name);
  };

  const getDescription = (): string => {
    return sdkOverrides.description || description || schema.description || '';
  };

  return (
    <div id={props.id} className="RootField">
      <div className="RootFieldTitle">
        <EditableField
          value={getTitle()}
          onChange={handleTitleChange}
          styleOverrides={{ field: { fontWeight: FontWeights.semibold } }}
          fontSize={FontSizes.size20}
        />
        {sdkOverrides.description !== false && (description || schema.description) && (
          <p className={classnames('RootFieldDescription', FontClassNames.smallPlus)}>
            {getDescription()}
            {sdkOverrides.helpLink && sdkOverrides.helpLinkText && (
              <>
                <br />
                <br />
                <a href={sdkOverrides.helpLink} target="_blank" rel="noopener noreferrer">
                  {sdkOverrides.helpLinkText}
                </a>
              </>
            )}
          </p>
        )}
      </div>

      {props.children}

      <div className="RootFieldMetaData">
        <div style={{ marginRight: '36px' }}>
          <span style={{ marginRight: '8px', fontWeight: FontWeights.semibold as number }}>
            {formatMessage('ID number')}
          </span>
          <span style={{ minWidth: '75px', display: 'inline-block' }}>{get(formData, '$designer.id')}</span>
        </div>
      </div>
    </div>
  );
};
