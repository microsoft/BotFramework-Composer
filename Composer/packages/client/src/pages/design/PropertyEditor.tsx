// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useRef } from 'react';
import AdaptiveForm from '@bfc/adaptive-form';
import Extension from '@bfc/extension';
import formatMessage from 'format-message';
import { Resizable, ResizeCallback } from 're-resizable';
import debounce from 'lodash/debounce';
import { Async } from 'office-ui-fabric-react/lib/Utilities';

import { useShell } from '../../shell';
import plugins from '../../plugins';
import { StoreContext } from '../../store';

import { formEditor } from './styles';

const PropertyEditor: React.FC = () => {
  const { api: shellApi, data: shellData } = useShell('PropertyEditor');
  const { actions } = useContext(StoreContext);
  const currentWidth = shellData?.userSettings?.propertyEditorWidth || 400;
  const _async = new Async();

  const handleResize: ResizeCallback = (_e, _dir, _ref, d) => {
    shellApi.updateUserSettings({ propertyEditorWidth: currentWidth + d.width });
  };

  const setMessage = useRef(debounce(actions.setMessage, 500)).current;

  const announce = (message: string) => {
    setMessage(message);
    _async.setTimeout(() => {
      setMessage(undefined);
    }, 2000);
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
          <AdaptiveForm formData={shellData.data} schema={shellData.schemas?.sdk?.content} announce={announce} />
        </Extension>
      </div>
    </Resizable>
  );
};

export { PropertyEditor };
