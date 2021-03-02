// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const getOS = () => {
  const userAgent = window.navigator.userAgent,
    platform = window.navigator.platform,
    macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
    windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
    iosPlatforms = ['iPhone', 'iPad', 'iPod'];
  const os = {
    isMacintosh: false,
    isLinux: false,
    isWindows: false,
    isAndroid: false,
    isiOS: false,
  };

  if (macosPlatforms.indexOf(platform) !== -1) {
    os.isMacintosh = true;
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os.isiOS = true;
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os.isWindows = true;
  } else if (/Android/.test(userAgent)) {
    os.isAndroid = true;
  } else if (/Linux/.test(platform)) {
    os.isLinux = true;
  }
  return os;
};

// font align with vscode https://github.com/microsoft/vscode/blob/main/src/vs/editor/common/config/editorOptions.ts#L3680
const DEFAULT_WINDOWS_FONT_FAMILY = "Consolas, 'Courier New', monospace";
const DEFAULT_MAC_FONT_FAMILY = "Menlo, Monaco, 'Courier New', monospace";
const DEFAULT_LINUX_FONT_FAMILY = "'Droid Sans Mono', 'monospace', monospace, 'Droid Sans Fallback'";

export const getDefaultFontSettings = () => {
  const PLATFORM = getOS();
  return {
    fontFamily: PLATFORM.isMacintosh
      ? DEFAULT_MAC_FONT_FAMILY
      : PLATFORM.isLinux
      ? DEFAULT_LINUX_FONT_FAMILY
      : DEFAULT_WINDOWS_FONT_FAMILY,
    fontWeight: 'normal',
    fontSize: '14px',
    lineHeight: 0,
    letterSpacing: 0,
  };
};
