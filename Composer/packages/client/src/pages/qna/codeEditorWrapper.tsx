// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
import React from 'react';
import { RouteComponentProps } from '@reach/router';
import querystring from 'query-string';

interface CodeEditorPropsWrapper extends RouteComponentProps<{}> {
  dialogId: string;
}

const CodeEditor = React.lazy(() => import('./code-editor'));
const InlineCodeEditor = React.lazy(() => import('./inlineCodeEditor'));

const CodeEditorWrapper: React.FC<CodeEditorPropsWrapper> = (props) => {
  const { dialogId } = props;
  const search = props.location?.search ?? '';
  const indexId = Number(querystring.parse(search).t);
  const inlineMode = typeof Number(indexId) === 'number' && !isNaN(Number(indexId));
  return inlineMode ? <InlineCodeEditor dialogId={dialogId} indexId={indexId} /> : <CodeEditor dialogId={dialogId} />;
};

export default CodeEditorWrapper;
