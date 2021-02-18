/* eslint-disable react/no-danger */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import ReactMarkdown from 'react-markdown';

type TemplateDetailViewProps = {
  templateId: string;
  readMe: string;
};

export const TemplateDetailView: React.FC<TemplateDetailViewProps> = (props) => {
  return <ReactMarkdown>{props.readMe}</ReactMarkdown>;
};
