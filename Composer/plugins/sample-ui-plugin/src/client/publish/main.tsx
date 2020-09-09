// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useEffect, useCallback, useState } from 'react';
import { setConfigIsValid, setPublishConfig, useConfigBeingEdited } from '@bfc/client-plugin-lib';

import { column, label, publishRoot, textField } from '../styles';

export const Main: React.FC<{}> = (props) => {
  const [configBeingEdited] = useConfigBeingEdited();
  const [val1, setVal1] = useState(configBeingEdited ? configBeingEdited.val1 : '');
  const [val2, setVal2] = useState(configBeingEdited ? configBeingEdited.val2 : '');
  const [val3, setVal3] = useState(configBeingEdited ? configBeingEdited.val3 : '');

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
    setPublishConfig({ val1, val2, val3 });
    if (val1 && val2 && val3) {
      setConfigIsValid(true);
    } else {
      setConfigIsValid(false);
    }
  }, [val1, val2, val3]);

  return (
    <div className={publishRoot}>
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
    </div>
  );
};
