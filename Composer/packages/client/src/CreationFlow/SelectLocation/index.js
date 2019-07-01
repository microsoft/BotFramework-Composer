/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, ChoiceGroup, Icon } from 'office-ui-fabric-react';

import { DialogWrapper } from './../../components/DialogWrapper';
import { choice, option, itemIcon, itemText, itemRoot, error } from './styles';

export function SelectLocationDialog(props) {
  const [selected, setSelected] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { hidden, onDismiss, folders, onOpen, defaultKey } = props;

  function handleOpen() {
    if (selected === null) {
      if (
        folders.findIndex(item => {
          return item.path === defaultKey;
        }) >= 0
      ) {
        onDismiss();
      } else {
        setErrorMessage(formatMessage('Please select one of these options.'));
      }
      return;
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
    <DialogWrapper
      hidden={hidden}
      onDismiss={onDismiss}
      title={formatMessage('Select a location')}
      subText={formatMessage('Which bot do you want to open?')}
    >
      {errorMessage && <div css={error}>{errorMessage}</div>}
      <ChoiceGroup
        defaultSelectedKey={defaultKey}
        options={folders.map(folder => {
          return {
            key: folder.path,
            text: folder.name,
            ariaLabel: folder.name,
            onRenderField: TemplateItem,
            styles: option,
          };
        })}
        onChange={(e, option) => {
          setErrorMessage('');
          setSelected(option.key);
        }}
        required={true}
        styles={choice}
        data-testid="SelectLocation"
      />
      <DialogFooter>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={handleOpen} text={formatMessage('Open')} data-testid="SelectLocationOpen" />
      </DialogFooter>
    </DialogWrapper>
  );
}
