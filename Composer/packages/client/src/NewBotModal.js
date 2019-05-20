/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { Modal, TextField, Button, Label } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { newContainer, newBotModal, newModalTitle, templateList, templateItem, actionWrap } from './styles';

export default function NewBotModal(props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { isOpen, onDismiss, templates } = props;

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} styles={newBotModal}>
      <div css={newContainer}>
        <div css={newModalTitle}>{formatMessage('Create new')}</div>
        <TextField label={formatMessage('Name:')} />
        <TextField disabled label={formatMessage('Location:')} />
        <div>
          <Label>Template:</Label>
          <ul css={templateList}>
            {templates.map((item, index) => {
              return (
                <li css={templateItem(index === selectedIndex)} key={item.id} onClick={() => setSelectedIndex(index)}>
                  {item.name}
                </li>
              );
            })}
          </ul>
        </div>
        <div css={actionWrap}>
          <Button styles={{ root: { marginRight: '20px' } }} onClick={onDismiss}>
            {formatMessage('Cancel')}
          </Button>
          <Button primary onClick={onDismiss}>
            {formatMessage('Create')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
