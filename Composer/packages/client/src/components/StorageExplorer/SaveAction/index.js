/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

import { saveButtonClass, saveContainer, saveInputClass, loading } from './styles';

export function SaveAction(props) {
  const [value, setValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isError, setError] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const { onSave, onGetErrorMessage } = props;

  const saveButtonClick = async () => {
    if (value === '') {
      setError(true);
      setErrorMessage('Please enter a new folder name');
    } else {
      setLoadingStatus(true);
      await onSave(value);
      setLoadingStatus(false);
    }
  };

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
      />{' '}
      {loadingStatus ? (
        <Spinner size={SpinnerSize.medium} css={loading} />
      ) : (
        <DefaultButton
          primary
          text="Save"
          disabled={isError}
          styles={saveButtonClass}
          iconProps={{
            iconName: 'SaveAs',
          }}
          onClick={saveButtonClick}
        />
      )}
    </div>
  );
}
