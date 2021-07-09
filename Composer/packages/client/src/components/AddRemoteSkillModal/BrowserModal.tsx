// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useRef } from 'react';
import formatMessage from 'format-message';
import JSZip from 'jszip';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

const FILE_SIZE_LIMIT = 1024 * 1024; // file size limit 1MB
export const BrowserModal = (props) => {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const onClickOpen = () => {
    inputFileRef?.current?.click();
  };

  const onChange = async (event) => {
    const zipFile = event.target.files?.item(0);
    if (zipFile) {
      if (zipFile.size > FILE_SIZE_LIMIT) {
        props.onError({ manifestUrl: '.zip file max size is 1MB' });
      } else {
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
      event.target.value = '';
    }
  };

  return (
    <>
      <DefaultButton
        styles={{ root: { marginLeft: '8px', float: 'right', marginTop: '29px' } }}
        text={formatMessage('Browse')}
        onClick={onClickOpen}
      />
      <input ref={inputFileRef} accept=".zip" style={{ display: 'none' }} type="file" onChange={onChange} />
    </>
  );
};
