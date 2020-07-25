// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { CommandBarButton } from '@fluentui/react/lib/Button';

type Props = {
  /**
   * Callback for when a file is selected.
   */
  onUpload: (file: File) => void;
};

export const CommandBarUploadButton = (props: Props) => {
  const { onUpload } = props;

  const inputFileRef = React.useRef<HTMLInputElement>();
  const onClickImport = () => {
    inputFileRef.current.click();
  };

  const onChange = () => {
    if (inputFileRef.current.files) {
      onUpload(inputFileRef.current.files.item(0));
    }
  };

  return (
    <>
      <CommandBarButton
        ariaLabel="Import JSON Schema"
        iconProps={{ iconName: 'Import' }}
        title="Import JSON Schema"
        onClick={onClickImport}
      >
        Import
      </CommandBarButton>
      <input ref={inputFileRef} accept=".dialog-schema" style={{ display: 'none' }} type="file" onChange={onChange} />
    </>
  );
};
