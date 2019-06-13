import React, { useState } from 'react';
import {
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  TextField,
  Spinner,
  SpinnerSize,
} from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { PropTypes } from 'prop-types';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';

import storage from '../../utils/storage';

const AUTHORINGKEY = 'authoringKey';
const FETCHSTATE = {
  PENDING: 0,
  SUCCESS: 1,
  FAILURE: 2,
};

export default function PublishLuisModal(props) {
  const { isOpen, onDismiss, onPublish } = props;
  const [authoringKey, setAuthoringKey] = useState(storage.get(AUTHORINGKEY, ''));
  const [errorMessage, setErrorMessage] = useState('');
  const [fetchState, setFetchState] = useState(FETCHSTATE.SUCCESS);

  const updateKey = (e, value) => {
    if (errorMessage !== '') {
      setErrorMessage('');
    }
    setAuthoringKey(value);
  };

  const handlePublish = async e => {
    e.preventDefault();

    if (authoringKey === '') {
      setErrorMessage('Authoring key can not be empty');
      return;
    }
    storage.set(AUTHORINGKEY, authoringKey);
    setFetchState(FETCHSTATE.PENDING);
    await onPublish(authoringKey);
    setFetchState(FETCHSTATE.SUCCESS);
    onDismiss();
  };

  return (
    <Dialog
      hidden={!isOpen}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Publish LUIS models'),
        subText: formatMessage(
          'To use your language model, first publish the latest intents and examples to your LUIS instance.'
        ),
        styles: {
          title: { fontWeight: FontWeights.bold },
          subText: { fontSize: FontSizes.medium, fontWeight: FontWeights.semibold },
        },
      }}
      modalProps={{
        isBlocking: false,
        styles: { main: { maxWidth: '450px !important' } },
      }}
    >
      <form onSubmit={handlePublish}>
        <TextField
          label={formatMessage('Authoring key:')}
          onChange={updateKey}
          defaultValue={authoringKey}
          required
          errorMessage={formatMessage(errorMessage)}
          componentRef={ref => {
            if (ref) {
              ref.focus();
            }
          }}
        />
      </form>
      <DialogFooter>
        <PrimaryButton onClick={handlePublish} text={formatMessage('Publish')}>
          {fetchState === FETCHSTATE.PENDING ? <Spinner size={SpinnerSize.small} /> : null}
        </PrimaryButton>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
      </DialogFooter>
    </Dialog>
  );
}

PublishLuisModal.propTypes = {
  isOpen: PropTypes.bool,
  onDismiss: PropTypes.func,
  onPublish: PropTypes.func,
};
