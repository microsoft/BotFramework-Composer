/* eslint-disable react/prop-types */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment } from 'react';

import { LocationSelectContent } from '../LocationBrowser/LocationSelectContent';

export function LocationPicker(props) {
  const { onActivate, onChange } = props;
  const [active, setActive] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  const onToggle = () => {
    // fire the onActivate handler if set and active is currently false (But about to be true)
    if (onActivate) {
      onActivate(!active);
    }
    setActive(!active);
  };

  const onPathChange = path => {
    setCurrentPath(path);
    onChange(path);
  };

  return (
    <Fragment>
      {!active && (
        <p>
          <label>Location</label>
          <br />
          <i>{currentPath}</i>
          <button onClick={onToggle}>Browse</button>
        </p>
      )}
      {active && (
        <Fragment>
          <LocationSelectContent onChange={onPathChange} />
          <button onClick={onToggle}>Done</button>
        </Fragment>
      )}
    </Fragment>
  );
}
