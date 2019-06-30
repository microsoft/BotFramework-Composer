/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, ChoiceGroup } from 'office-ui-fabric-react';

import { DialogWrapper } from './../../components/DialogWrapper';
import { choice } from './styles';

export function SelectLocationDialog(props) {
  const [selected, setSelected] = useState(null);
  const { hidden, onDismiss, folders, onOpen } = props;

  function handleOpen() {
    if (selected === null) {
      return;
    } else {
      onOpen(selected);
    }
  }

  return (
    <DialogWrapper
      hidden={hidden}
      onDismiss={onDismiss}
      title="Select a location"
      subText="Which bot do you want to open?"
    >
      <ChoiceGroup
        options={folders.map(folder => {
          return {
            key: folder.path,
            text: formatMessage(folder.name),
          };
        })}
        onChange={(e, option) => {
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
