// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FontSizes } from '@uifabric/fluent-theme';
export const linkStyle = {
  root: { color: '#56CCF2', selectors: { ':hover': { color: '#56CCF2' } } },
};

export const wrapperStyle = {
  backgroundColor: '#333',
  color: '#FFF',
  paddingBottom: '20px',
};

export const h2Style = {
  fontSize: FontSizes.size20,
  marginTop: -5,
};
export const h3Style = {
  fontSize: FontSizes.size16,
  marginTop: 0,
};

export const ulStyle = {
  listStyleType: 'none',
  margin: 0,
  padding: 0,
};

export const ulStyleGuides = {
  listStyleType: 'none',
  margin: 0,
  padding: 0,
  marginTop: -5,
};

export const liStyle = {
  paddingTop: '5px',
};

export const commandbarStyle = { root: { paddingLeft: 12, background: 'none', borderBottom: '1px solid #3d3d3d' } };
export const buttonStyles = {
  icon: { color: '#56CCF2' },
  iconHovered: { color: '#56CCF2' },
  root: { background: 'none', color: '#FFF' },
  rootHovered: { color: '#56CCF2' },
};
