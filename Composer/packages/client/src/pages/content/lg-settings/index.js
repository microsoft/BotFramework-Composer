/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useContext } from 'react';

import { Store } from '../../../store/index';

export function LanguageGenerationSettings() {
  const { state } = useContext(Store);
  const { files } = state;

  const lgFiles = files.filter(file => file.name.includes('.lg'));
  let currentFileContent = '';
  if (lgFiles && lgFiles.length > 0) {
    currentFileContent = lgFiles[0].content;
  }
  return (
    <Fragment>
      <div>
        <div>Language Understanding</div>
        <div>{currentFileContent}</div>
      </div>
    </Fragment>
  );
}
