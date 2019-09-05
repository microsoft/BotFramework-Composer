import React, { useState, useContext, useEffect, useRef, Fragment } from 'react';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, Stack, TextField } from 'office-ui-fabric-react';

import { LocationSelectContent } from '../LocationBrowser/LocationSelectContent';

import { StoreContext } from './../../store';
import { name, description, locationOnly, locationBrowse } from './styles';

const nameRegex = /^[a-zA-Z0-9-_.]+$/;

const validateForm = data => {
  const errors = {};
  const { name } = data;

  if (!name || !nameRegex.test(name)) {
    errors.name = formatMessage(
      'Spaces and special characters are not allowed. Use letters, numbers, -, or _., numbers, -, and _'
    );
  }

  return errors;
};

export function DefineConversation(props) {
  const { onSubmit, onGetErrorMessage, onDismiss } = props;
  const { state } = useContext(StoreContext);
  const { storages } = state;
  const currentStorageIndex = useRef(0);

  const [formData, setFormData] = useState({ errors: {} });
  const [disable, setDisable] = useState(false);
  const [locationActive, setLocationActive] = useState(false);
  const [customPath, setCustomPath] = useState();
  const [displayPath, setDisplayPath] = useState();

  // set the default path
  useEffect(() => {
    const index = currentStorageIndex.current;
    setCustomPath(storages[index].path);
    updateForm('location')(null, storages[index].path);
  }, [storages]);

  // update the dislpay path only when the form data is updated.
  useEffect(() => {
    setDisplayPath(shortenPath(formData.location));
  }, [formData]);

  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      errors: {},
      [field]: newValue,
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errors = validateForm(formData);

    if (Object.keys(errors).length) {
      setFormData({
        ...formData,
        errors,
      });
      return;
    }

    onSubmit({
      ...formData,
    });
  };

  //disable the next button if the text has errors.
  const getErrorMessage = text => {
    if (typeof onGetErrorMessage === 'function') {
      const result = onGetErrorMessage(text);
      if (result === '' && disable) {
        setDisable(false);
      }

      if (result !== '' && !disable) {
        setDisable(true);
      }

      return result;
    } else {
      return '';
    }
  };

  const toggleLocationPicker = () => {
    setLocationActive(!locationActive);
  };

  // update the path in the form and toggle the location picker.
  const updateLocation = () => {
    updateForm('location')(null, customPath);
    toggleLocationPicker();
  };

  /**
   * Truncate a path in a way that maintains the last element
   * @param {*} path
   * @param {*} length
   */
  const shortenPath = (incoming_path, length = 30) => {
    if (incoming_path && incoming_path.length > length) {
      let str = '';
      const bits = incoming_path.split(/\//);
      const adjusted_length = length - (4 + bits[1].length);
      for (let b = bits.length - 1; b > 1; b--) {
        if (str.length + bits[b].length + 1 <= adjusted_length) {
          str = '/' + bits[b] + str;
        }
      }
      // results in something like /user/.../folders
      str = '/' + bits[1] + '/...' + str;
      return str;
    }
    // else
    return incoming_path;
  };

  return (
    <form onSubmit={handleSubmit}>
      {!locationActive && (
        <Fragment>
          <Stack>
            <TextField
              label={formatMessage('Name')}
              value={formData.name}
              styles={name}
              onChange={updateForm('name')}
              errorMessage={formData.errors.name}
              onGetErrorMessage={getErrorMessage}
              data-testid="NewDialogName"
            />
            <TextField
              styles={description}
              value={formData.description}
              label={formatMessage('Description')}
              multiline
              resizable={false}
              onChange={updateForm('description')}
            />
            <Stack horizontal>
              <Stack.Item grow>
                <TextField
                  styles={locationBrowse}
                  value={displayPath}
                  suffix={'/' + (formData.name || formatMessage('[BotName]'))}
                  readOnly={true}
                  label={formatMessage('Destination folder')}
                  resizable={false}
                />
              </Stack.Item>
              <Stack.Item align="end" disableShrink>
                <DefaultButton onClick={toggleLocationPicker} text={formatMessage('Browse')} />
              </Stack.Item>
            </Stack>
          </Stack>
          <DialogFooter>
            <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
            <PrimaryButton onClick={handleSubmit} text={formatMessage('Next')} disabled={disable} />
          </DialogFooter>
        </Fragment>
      )}
      {locationActive && (
        <Fragment>
          <Stack>
            <TextField
              styles={locationOnly}
              value={shortenPath(customPath)}
              suffix={'/' + (formData.name || formatMessage('[BotName]'))}
              readOnly={true}
              label={formatMessage('Destination folder')}
              resizable={false}
            />
            <LocationSelectContent onChange={setCustomPath} />
          </Stack>
          <DialogFooter>
            <DefaultButton onClick={toggleLocationPicker} text={formatMessage('Cancel')} />
            <PrimaryButton onClick={updateLocation} text={formatMessage('OK')} />
          </DialogFooter>
        </Fragment>
      )}
    </form>
  );
}
