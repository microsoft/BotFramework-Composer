import { css } from '@emotion/core';

export const hostedSettings = css`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

export const hostedControls = css`
  margin-bottom: 18px;

  & > h1 {
    margin-top: 0;
  }
`;

export const hostedToggle = css`
  display: flex;

  & > * {
    margin-right: 2rem;
  }
`;

export const slotChoice = css`
  max-width: 40ch;
`;

export const settingsEditor = css`
  flex: 1;
  max-height: 70%;
`;
