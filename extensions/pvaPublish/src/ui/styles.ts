// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CSSProperties } from 'react';

export const root: CSSProperties = {
  display: 'flex',
  flexFlow: 'column nowrap',
  height: 'auto',
  position: 'relative',
  backgroundColor: 'white',
  padding: '0',
  fontFamily:
    '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
};

export const row: CSSProperties = {
  display: 'flex',
  flexFlow: 'row nowrap',
};

export const col: CSSProperties = {
  display: 'flex',
  flexFlow: 'column nowrap',
};

export const button: CSSProperties = {
  fontSize: '14px',
  fontWeight: 400,
  boxSizing: 'border-box',
  display: 'inline-block',
  textAlign: 'center',
  cursor: 'pointer',
  paddingTop: 0,
  paddingRight: 16,
  paddingBottom: 0,
  paddingLeft: 16,
  minWidth: 80,
  height: 32,
  backgroundColor: 'rgb(255, 255, 255)',
  color: 'rgb(50, 49, 48)',
  userSelect: 'none',
  outline: 'transparent',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgb(138, 136, 134)',
  borderImage: 'initial',
  textDecoration: 'none',
  borderRadius: 2,
};

export const dropdown: CSSProperties = {
  width: '100%',
  height: 32,
  padding: '0 8px 0 8px',
  marginTop: 8,
};

export const label: CSSProperties = {
  display: 'block',
  marginTop: 12,
};
