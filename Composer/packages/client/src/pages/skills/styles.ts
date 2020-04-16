// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { css } from '@emotion/core';

export const ContentHeaderStyle = css`
  padding: 5px 20px;
  height: 60px;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  align-items: center;
`;

export const HeaderText = css`
  font-size: ${FontSizes.xLarge};
  font-weight: ${FontWeights.semibold};
`;

export const ContentStyle = css`
  margin-left: 2px;
  display: flex;
  border-top: 1px solid #dddddd;
  flex: 1;
  position: relative;
  nav {
    ul {
      margin-top: 0px;
    }
  }
`;

export const TableView = css`
  flex: 4;
  margin: 20px;
  height: calc(100vh - 200px);
  position: relative;
  overflow: visible;
  fontsize: 16px;
`;

export const TableCell = css`
  white-space: pre-wrap;
  font-size: 14px;
  textarea,
  input {
    border: 1px solid #dddddd;
  }
`;

export const ChoiceGroupAlignHorizontal = css`
  .ms-ChoiceFieldGroup-flexContainer {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
  }
  .ms-ChoiceField-wrapper {
    margin-right: 2rem;
  }
`;

export const FormFieldManifestUrl = css`
  width: 40rem;
`;

export const FormFieldEditName = css`
  width: 20rem;
`;

export const FormFieldAlignHorizontal = css`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
`;

export const FormFieldName = css`
  width: 10rem;
  margin-right: 1rem;
`;

export const FormFieldAppId = css`
  width: 20rem;
`;

export const FormFieldEndpoint = css`
  width: 40rem;
`;

export const ActionButton = css`
  font-size: ${FontSizes.large};
  margin: 1rem;
`;

export const MarginLeftSmall = css`
  margin-left: ${FontSizes.small};
`;
