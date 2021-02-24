// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState } from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import formatMessage from 'format-message';
import { JsonEditor } from '@bfc/code-editor';
import { ExtensionSettings } from '@botframework-composer/types';
import { useRecoilValue } from 'recoil';

import { dispatcherState } from '../../recoilModel';

const editorStyles = css`
  height: 500px;
`;

type ExtensionsSettingsProps = {
  settings: ExtensionSettings;
  isOpen: boolean;
  onDismiss: () => void;
};

const ExtensionsSettings: React.FC<ExtensionsSettingsProps> = (props) => {
  const { isOpen, onDismiss, settings } = props;
  const [value, setValue] = useState(settings);
  const { updateExtensionSettings } = useRecoilValue(dispatcherState);

  const handleChange = (newSettings) => {
    setValue(newSettings);
  };

  const handleDismiss = () => {
    updateExtensionSettings(value);
    onDismiss();
  };

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.close,
        title: formatMessage('Extension Settings'),
      }}
      hidden={!isOpen}
      minWidth="800px"
      onDismiss={handleDismiss}
    >
      <div css={editorStyles}>
        <JsonEditor
          schema={`${location.protocol}//${location.host}/api/extensions/settings/schema.json`}
          value={settings}
          onChange={handleChange}
        />
      </div>
    </Dialog>
  );
};

export { ExtensionsSettings };
