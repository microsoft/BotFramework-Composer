/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext, Fragment } from 'react';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, ChoiceGroup, Icon } from 'office-ui-fabric-react';
import { navigate } from '@reach/router';

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
        navigate('/dialogs/Main');
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
