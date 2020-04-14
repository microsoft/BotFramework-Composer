// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { useState, useContext, Fragment } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';

import { navigateTo } from '../../../utils';
import { StoreContext } from '../../../store';

import { choice, option, itemIcon, itemText, itemRoot, error } from './styles';

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
        onChange={(e, option: any) => {
          setErrorMessage('');
          setSelected(option.path);
        }}
        required={true}
        styles={choice as any}
        data-testid="SelectLocation"
      />
      <DialogFooter>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={handleOpen} text={formatMessage('Open')} data-testid="SelectLocationOpen" />
      </DialogFooter>
    </Fragment>
  );
}
