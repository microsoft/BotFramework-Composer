// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CommandBarButton } from '@fluentui/react/lib/Button';
import formatMessage from 'format-message';
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
    }
  };

  const title = formatMessage('Import JSON Schema');

  return (
    <>
      <CommandBarButton ariaLabel={title} iconProps={{ iconName: 'Import' }} title={title} onClick={onClickImport}>
        Import
      </CommandBarButton>
      <input ref={inputFileRef} accept={accept} style={{ display: 'none' }} type="file" onChange={onChange} />
    </>
  );
};
