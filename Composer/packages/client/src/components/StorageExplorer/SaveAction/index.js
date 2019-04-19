/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

import { saveButtonClass, saveContainer, saveInputClass } from './styles';

export function SaveAction(props) {
  const [value, setValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isError, setError] = useState(false);
  const { onSave, onGetErrorMessage } = props;

  function saveButtonClick() {
    if (value === '') {
      setError(true);
      setErrorMessage('Please enter a new folder name');
    } else {
      onSave(value);
    }
  }

  return (
    <div css={saveContainer}>
      <TextField
        css={saveInputClass}
        placeholder="Please enter a new folder name"
        autoComplete="off"
        errorMessage={errorMessage}
        onChange={(event, value) => {
          setValue(value);
        }}
        onGetErrorMessage={onGetErrorMessage}
        onNotifyValidationResult={errorMessage => {
          setErrorMessage('');
          if (errorMessage !== '' && !isError) {
            setError(true);
          }
          if (errorMessage === '' && isError) {
            setError(false);
          }
        }}
      />
      <DefaultButton
        primary
        text="Save"
        disabled={isError}
        styles={saveButtonClass}
        iconProps={{ iconName: 'SaveAs' }}
        onClick={saveButtonClick}
      />
    </div>
  );
}
