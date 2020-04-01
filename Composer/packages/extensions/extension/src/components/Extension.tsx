// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useMemo } from 'react';
import { ShellApi, ShellData } from '@bfc/shared';

import ExtensionContext from '../extensionContext';

interface ExtensionProps {
  shell: ShellApi;
  shellData: ShellData;
}

export const Extension: React.FC<ExtensionProps> = function Extension(props) {
  const { shell, shellData } = props;

  const context = useMemo(() => {
    return { shellApi: shell, shellData };
  }, [shell, shellData]);

  return <ExtensionContext.Provider value={context}>{props.children}</ExtensionContext.Provider>;
};

export default Extension;
