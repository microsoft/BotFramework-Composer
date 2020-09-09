// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from 'emotion';

export const publishRoot = css`
  position: relative;
  display: flex;
  flex-flow: column nowrap;
`;

export const pageRoot = css`
  display: flex;
  flex-flow: column nowrap;
  padding: 25px;
`;

export const column = css`
  display: flex;
  flex-flow: column nowrap;
`;

// copied from Fluent
export const textField = css`
  font-size: 14px;
  font-weight: 400;
  box-shadow: none;
  margin: 0;
  padding: 0px 8px;
  box-sizing: border-box;
  border-radius: 2px;
  border: 1px solid rgb(96, 94, 92);
  background: none transparent;
  color: rgb(50; 49; 48);
  width: 100%;
  min-width: 0;
  text-overflow: ellipsis;
  outline: 0;
  height: 32;

  &:focus {
    border-width: 2px;
    border-color: rgb(0, 120, 212);
  }
`;

// copied from Fluent
export const label = css`
  font-family: 'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto,
    'Helvetica Neue', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: rgb(50, 49, 48);
  box-sizing: border-box;
  box-shadow: none;
  margin: 0;
  display: block;
  padding: 5px 0px;
  overflow-wrap: break-word;
`;

export const shortTextField = css`
  width: 250px;
`;

export const output = css`
  font-family: 'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto,
    'Helvetica Neue', sans-serif;
  font-size: 14px;
  font-weight: 400;
`;
