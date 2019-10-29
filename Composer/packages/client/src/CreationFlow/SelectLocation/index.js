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
import React, { useState, useContext, Fragment } from 'react';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, ChoiceGroup, Icon } from 'office-ui-fabric-react';

import { navigateTo } from '../../utils';

import { choice, option, itemIcon, itemText, itemRoot, error } from './styles';
import { StoreContext } from './../../store';
export function SelectLocation(props) {
  const { actions } = useContext(StoreContext);
  const [selected, setSelected] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const { onDismiss, folders, onOpen, defaultKey } = props;
  const { startBot } = actions;
  function handleOpen() {
    if (selected === null) {
      if (
        folders.findIndex(item => {
          return item.name === defaultKey;
        }) >= 0
      ) {
        startBot(true);
        onDismiss();
        navigateTo('/dialogs/Main');
      } else {
        setErrorMessage(formatMessage('Please select one of these options.'));
      }
    } else {
      onOpen(selected);
    }
  }

  function TemplateItem(props) {
    const { checked, text, key } = props;
    return (
      <div key={key} css={itemRoot(checked)}>
        {checked && <Icon iconName="CompletedSolid" css={itemIcon} />}
        <span css={itemText}>{text}</span>
      </div>
    );
  }

  return (
    <Fragment>
      {errorMessage && <div css={error}>{errorMessage}</div>}
      <ChoiceGroup
        defaultSelectedKey={defaultKey}
        options={folders.map(folder => {
          return {
            key: folder.name,
            path: folder.path,
            text: folder.name,
            ariaLabel: folder.name,
            onRenderField: TemplateItem,
            styles: option,
          };
        })}
        onChange={(e, option) => {
          setErrorMessage('');
          setSelected(option.path);
        }}
        required={true}
        styles={choice}
        data-testid="SelectLocation"
      />
      <DialogFooter>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={handleOpen} text={formatMessage('Open')} data-testid="SelectLocationOpen" />
      </DialogFooter>
    </Fragment>
  );
}
