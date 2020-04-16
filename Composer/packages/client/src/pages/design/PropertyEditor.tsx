// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import AdaptiveForm from '@bfc/adaptive-form';
import Extension from '@bfc/extension';
import formatMessage from 'format-message';
import { Resizable, ResizeCallback } from 're-resizable';

import { useShell } from '../../shell';
import plugins from '../../plugins';

import { formEditor } from './styles';

const PropertyEditor: React.FC = () => {
  const { api: shellApi, data: shellData } = useShell('PropertyEditor');
  const currentWidth = shellData?.userSettings?.propertyEditorWidth || 400;

  const handleResize: ResizeCallback = (_e, _dir, _ref, d) => {
    shellApi.updateUserSettings({ propertyEditorWidth: currentWidth + d.width });
  };

  return (
    <Resizable
      enable={{
        left: true,
      }}
      maxWidth={800}
      minWidth={400}
      onResizeStop={handleResize}
      size={{ width: currentWidth, height: 'auto' }}
    >
      <div
        aria-label={formatMessage('form editor')}
        css={formEditor}
        data-testid="PropertyEditor"
        key={shellData.focusPath}
      >
        <Extension plugins={plugins} shell={shellApi} shellData={shellData}>
          <AdaptiveForm formData={shellData.data} schema={shellData.schemas?.sdk?.content} />
        </Extension>
      </div>
    </Resizable>
  );
};

export { PropertyEditor };
