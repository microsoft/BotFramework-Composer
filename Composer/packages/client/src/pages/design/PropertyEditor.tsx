// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import AdaptiveForm from '@bfc/adaptive-form';
import Extension from '@bfc/extension';
import formatMessage from 'format-message';
import { Resizable, ResizeCallback } from 're-resizable';

import { useShell } from '../../useShell';
import plugins from '../../plugins';

import { formEditor } from './styles';

const PropertyEditor: React.FC = () => {
  const { api: shellApi, data: shellData } = useShell('PropertyEditor');
  const currentWidth = shellData?.userSettings?.propertyEditor?.width || 400;

  const handleResize: ResizeCallback = (_e, _dir, _ref, d) => {
    shellApi.updateUserSettings({ propertyEditor: { width: currentWidth + d.width } });
  };

  return (
    <Resizable
      size={{ width: currentWidth, height: 'auto' }}
      minWidth={400}
      maxWidth={800}
      enable={{
        left: true,
      }}
      onResizeStop={handleResize}
    >
      <div
        css={formEditor}
        aria-label={formatMessage('form editor')}
        data-testid="PropertyEditor"
        key={shellData.focusPath}
      >
        <Extension shell={shellApi} shellData={shellData} plugins={plugins}>
          <AdaptiveForm formData={shellData.data} schema={shellData.schemas?.sdk?.content} />
        </Extension>
      </div>
    </Resizable>
  );
};

export { PropertyEditor };
