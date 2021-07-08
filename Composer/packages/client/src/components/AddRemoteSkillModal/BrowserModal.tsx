// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useRef } from 'react';
import formatMessage from 'format-message';
import JSZip from 'jszip';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

export const BrowserModal = (props) => {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const onClickOpen = () => {
    inputFileRef?.current?.click();
  };

  const onChange = async () => {
    const zipFile = inputFileRef?.current?.files?.item(0);
    if (zipFile) {
      // create zip instance
      const jszip = new JSZip();
      jszip
        .loadAsync(zipFile)
        .then((zip) => {
          props.onUpdate(zipFile.name, zip.files);
        })
        .catch((error) => {
          props.onError({ manifestUrl: error.toString() });
        });
    }
  };

  return (
    <>
      <DefaultButton
        styles={{ root: { marginLeft: '8px', float: 'right', marginTop: '29px' } }}
        text={formatMessage('Browse')}
        onClick={onClickOpen}
      />
      <input
        ref={inputFileRef}
        accept=".zip,.rar,.7zip"
        max-file-size="1048576"
        style={{ display: 'none' }}
        type="file"
        onChange={onChange}
      />
    </>
  );
};
