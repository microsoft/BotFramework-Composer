// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
import React, { useState, useEffect, useContext } from 'react';
import { LuEditor } from '@bfc/code-editor';
import isEmpty from 'lodash/isEmpty';
import { RouteComponentProps } from '@reach/router';
import querystring from 'query-string';

import { StoreContext } from '../../store';

interface CodeEditorProps extends RouteComponentProps<{}> {
  dialogId: string;
}

const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { state } = useContext(StoreContext);
  const { qnaFiles, locale, projectId } = state;
  const { dialogId } = props;
  const file = qnaFiles.find(({ id }) => id === `${dialogId}.${locale}`);
  const search = props.location?.search ?? '';
  const searchSectionName = querystring.parse(search).t;
  const sectionId = Array.isArray(searchSectionName)
    ? searchSectionName[0]
    : typeof searchSectionName === 'string'
    ? searchSectionName
    : undefined;

  const [content, setContent] = useState(file?.content);

  useEffect(() => {
    // reset content with file.content initial state
    if (!file || isEmpty(file) || content) return;
    const value = file.content;
    setContent(value);
  }, [file, sectionId, projectId]);

  return <LuEditor value={content} onChange={() => {}} />;
};

export default CodeEditor;
