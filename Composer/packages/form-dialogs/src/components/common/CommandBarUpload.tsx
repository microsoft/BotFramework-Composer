// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import * as React from 'react';

type Props = {
  /**
   * Allowed files extension.
   */
  accept: string;
  /**
   * Callback for when a file is selected.
   */
  onUpload: (file: File) => void;
};

export const CommandBarUploadButton = (props: Props) => {
  const { onUpload, accept } = props;

  const inputFileRef = React.useRef<HTMLInputElement>();
  const onClickImport = () => {
    inputFileRef.current.click();
  };

  const onChange = () => {
    if (inputFileRef.current.files) {
      onUpload(inputFileRef.current.files.item(0));
      inputFileRef.current.value = null;
    }
  };

  const title = formatMessage('Import schema');

  return (
    <>
      <CommandBarButton
        ariaLabel={title}
        iconProps={{ iconName: 'Import' }}
        styles={{ root: { height: '100%' } }}
        text={title}
        title={title}
        onClick={onClickImport}
      />
      <input ref={inputFileRef} accept={accept} style={{ display: 'none' }} type="file" onChange={onChange} />
    </>
  );
};
