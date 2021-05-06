// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum OS {
  Windows = 'Windows',
  MacOS = 'MacOS',
  Linux = 'Linux',
  Unix = 'Unix',
  Unknown = 'Unknown',
}

export function platform(userAgent: string = window.navigator.userAgent): OS {
  if (userAgent.includes('Win')) {
    return OS.Windows;
  }

  if (userAgent.includes('Mac')) {
    return OS.MacOS;
  }

  if (userAgent.includes('Linux')) {
    return OS.Linux;
  }

  if (userAgent.includes('X11')) {
    return OS.Unix;
  }

  return OS.Unknown;
}
