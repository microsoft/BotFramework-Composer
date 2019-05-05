import React, { useState } from 'react';
import { Modal, TextField, Button, Dropdown, IconButton } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import findindex from 'lodash.findindex';
import { PropTypes } from 'prop-types';

const options = [
  {
    key: 'azure',
    text: 'AzureBlobStorage',
  },
];

export default function NewStorageModal(props) {
  const { isOpen, onDismiss, onSubmit, storages } = props;
  const [storageData, setStorageData] = useState({ type: 'AzureBlobStorage' });

  const checkDuplicate = value => {
    const index = findindex(storages, { name: value });
    if (index >= 0) {
      return 'Duplicate storage name';
    }
    return '';
  };

  const updateInfo = field => (e, newValue) => {
    const value = newValue;

    setStorageData({
      ...storageData,
      [field]: value,
    });
  };

  const handleSubmit = e => {
    e.preventDefault();

    onSubmit({
      ...storageData,
      id: new Date().getTime() + '',
    });
  };

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} styles={{ main: { maxWidth: '500px', width: '100%' } }}>
      <div style={{ padding: '30px' }}>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <IconButton
            iconProps={{ iconName: 'ChromeClose' }}
            title={formatMessage('Add Dialog')}
            ariaLabel={formatMessage('Add Dialog')}
            onClick={onDismiss}
          />
        </div>
        <div>
          <form onSubmit={handleSubmit}>
            <Dropdown
              label={formatMessage('Storage Type')}
              options={options}
              onChange={updateInfo('type')}
              defaultSelectedKey="azure"
              required
            />
            <TextField
              label={formatMessage('Name')}
              onChange={updateInfo('name')}
              onGetErrorMessage={checkDuplicate}
              required
            />
            <TextField label={formatMessage('Account')} onChange={updateInfo('account')} required />
            <TextField label={formatMessage('Key')} onChange={updateInfo('key')} required />
            <TextField label={formatMessage('Path')} onChange={updateInfo('path')} required />
            <Button
              onClick={handleSubmit}
              type="submit"
              primary
              styles={{
                root: {
                  width: '100%',
                  marginTop: '20px',
                },
              }}
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
}

NewStorageModal.propTypes = {
  storages: PropTypes.array,
  isOpen: PropTypes.bool,
  onDismiss: PropTypes.func,
  onSubmit: PropTypes.func,
};
