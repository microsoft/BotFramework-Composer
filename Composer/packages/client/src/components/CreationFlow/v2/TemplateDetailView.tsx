/* eslint-disable react/no-danger */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import MarkdownIt from 'markdown-it';

type TemplateDetailViewProps = {
  templateId: string;
  readMe: string;
};

const md = new MarkdownIt();

export const TemplateDetailView: React.FC<TemplateDetailViewProps> = (props) => {
  return <div className="content">{md.render(props.readMe)}</div>;
};
