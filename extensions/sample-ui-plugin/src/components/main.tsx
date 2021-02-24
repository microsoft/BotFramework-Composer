// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useCallback, useState } from 'react';
import { usePublishApi } from '@bfc/extension-client';

import { backButton, buttonBar, column, label, publishRoot, saveButton, textField, title } from '../styles';

export const Main: React.FC<{ title: string }> = (props) => {
  const { closeDialog, onBack, savePublishConfig, publishConfig } = usePublishApi();
  const [val1, setVal1] = useState(publishConfig ? publishConfig.val1 : '');
  const [val2, setVal2] = useState(publishConfig ? publishConfig.val2 : '');
  const [val3, setVal3] = useState(publishConfig ? publishConfig.val3 : '');
  const [configIsValid, setConfigIsValid] = useState(false);

  const updateVal1 = useCallback((ev) => {
    setVal1(ev.target.value);
  }, []);

  const updateVal2 = useCallback((ev) => {
    setVal2(ev.target.value);
  }, []);

  const updateVal3 = useCallback((ev) => {
    setVal3(ev.target.value);
  }, []);

  useEffect(() => {
    if (val1 && val2 && val3) {
      setConfigIsValid(true);
    } else {
      setConfigIsValid(false);
    }
  }, [val1, val2, val3]);

  const onSave = useCallback(() => {
    savePublishConfig({ val1, val2, val3 });
    closeDialog();
  }, [val1, val2, val3]);

  return (
    <div className={publishRoot}>
      <h3 className={title}>{props.title}</h3>
      <div className={column}>
        <label className={label} htmlFor={'val1'}>
          Value 1
        </label>
        <input
          className={textField}
          id={'val1'}
          placeholder={'Enter a value...'}
          value={val1}
          onChange={updateVal1}
        ></input>
      </div>
      <div className={column}>
        <label className={label} htmlFor={'val2'}>
          Value 2
        </label>
        <input
          className={textField}
          id={'val2'}
          placeholder={'Enter a value...'}
          value={val2}
          onChange={updateVal2}
        ></input>
      </div>
      <div className={column}>
        <label className={label} htmlFor={'val3'}>
          Value 3
        </label>
        <input
          className={textField}
          id={'val3'}
          placeholder={'Enter a value...'}
          value={val3}
          onChange={updateVal3}
        ></input>
      </div>
      <div className={buttonBar}>
        <button className={backButton} onClick={onBack}>
          Back
        </button>
        <button className={saveButton} disabled={!configIsValid} onClick={onSave}>
          Save
        </button>
      </div>
    </div>
  );
};
