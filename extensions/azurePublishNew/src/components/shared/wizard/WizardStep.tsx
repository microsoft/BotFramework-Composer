// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import styled from '@emotion/styled';

const Footer = styled.div`
  flex: auto;
  flex-grow: 0;
  background: #ffffff;
  border-top: 1px solid #edebe9;
  width: 100%;
  text-align: right;
  height: fit-content;
  padding: 24px 0px 0px;
`;
const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 430px;
  height: calc(100vh - 65px);
`;

export const WizardStep = ({ children }) => {
  const getFooter = () => {
    return React.Children.toArray(children).filter((step) => {
      return (step as any)?.type?.name === 'WizardFooter';
    });
  };

  const getContent = () => {
    return React.Children.toArray(children).filter((step) => {
      return (step as any)?.type?.name !== 'WizardFooter';
    });
  };

  return (
    <>
      <Content>{getContent()}</Content>
      <Footer>{getFooter()}</Footer>
    </>
  );
};
