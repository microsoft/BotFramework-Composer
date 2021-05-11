// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { platform, OS } from '../../utils/os';

// font align with vscode https://github.com/microsoft/vscode/blob/main/src/vs/editor/common/config/editorOptions.ts#L3680
const DEFAULT_WINDOWS_FONT_FAMILY = "Consolas, 'Courier New', monospace";
const DEFAULT_MAC_FONT_FAMILY = "Menlo, Monaco, 'Courier New', monospace";
const DEFAULT_LINUX_FONT_FAMILY = "'Droid Sans Mono', 'monospace', monospace, 'Droid Sans Fallback'";

export const getDefaultFontSettings = () => {
  const platformName = platform();
  return {
    fontFamily:
      platformName === OS.MacOS
        ? DEFAULT_MAC_FONT_FAMILY
        : platformName === OS.Linux
        ? DEFAULT_LINUX_FONT_FAMILY
        : DEFAULT_WINDOWS_FONT_FAMILY,
    fontWeight: 'normal',
    fontSize: '14px',
    lineHeight: 0,
    letterSpacing: 0,
  };
};
