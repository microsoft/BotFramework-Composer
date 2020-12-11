/* eslint-disable react/no-danger */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

type TemplateDetailViewProps = {
  templateId: string;
  readMe: string;
};

export const TemplateDetailView: React.FC<TemplateDetailViewProps> = (props) => {
  // TODO: use templateID to search for template metadata in template state to get link to readMe to be rendered here
  return <div className="content" dangerouslySetInnerHTML={{ __html: props.readMe }}></div>;
};
