// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useCallback, useState } from 'react';
import { render } from '@bfc/client-plugin-lib';
import { cx } from 'emotion';

import { label, output, pageRoot, shortTextField, textField } from '../styles';

const Main: React.FC<{}> = (props) => {
  const [text, setText] = useState('');

  const onInputChange = useCallback((ev) => {
    setText(ev.target.value);
  }, []);

  return (
    <div className={pageRoot}>
      <label className={label} htmlFor={'sample-page-plugin-1'}>
        Type something in the text field
      </label>
      <input
        className={cx(textField, shortTextField)}
        id={'sample-page-plugin-1'}
        type="text"
        onChange={onInputChange}
        placeholder="Type something in here"
      ></input>
      <p className={output}>{text}</p>
    </div>
  );
};

render(<Main />);
