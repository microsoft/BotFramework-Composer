import React, { useState } from 'react';
import { TextField, Button, Dropdown } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

const options = [
  {
    key: 'azure',
    text: 'AzureBlobStorage',
  },
];

export default function AddStoragePanel(props) {
  const { onSubmit } = props;
  const [storageData, setStorageData] = useState({ type: 'AzureBlobStorage' });

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
    <div
      style={{
        paddingLeft: '10px',
        width: '600px',
      }}
    >
      <form onSubmit={handleSubmit}>
        <Dropdown
          label={formatMessage('Storage Type')}
          options={options}
          onChange={updateInfo('type')}
          defaultSelectedKey="azure"
          required
        />
        <TextField label={formatMessage('Name')} onChange={updateInfo('name')} required />
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
  );
}
