import React from 'react';
import ErrorBoundary, { FallbackProps } from 'react-error-boundary';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';

import { FormEditor, FormEditorProps } from './FormEditor';

const ErrorInfo: React.FC<FallbackProps> = ({ componentStack, error }) => (
  <div style={{ marginRight: '20px' }}>
    <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
      <p style={{ whiteSpace: 'pre-wrap' }}>
        <strong>Oops! An error occured in the form editor!</strong>
        <br />
        This is likely due to malformed data or missing functionality in Composer.
        <br />
        Try navigating to another node in the visual editor.
      </p>
      <p>Here’s what we know…</p>
      <p style={{ whiteSpace: 'pre-wrap' }}>
        <strong>Error:</strong> {error && error.toString()}
      </p>
      <p style={{ whiteSpace: 'pre-wrap' }}>
        <strong>Component Stacktrace:</strong> {componentStack}
      </p>
    </MessageBar>
  </div>
);

const App: React.FC<FormEditorProps> = props => {
  return (
    <ErrorBoundary key={JSON.stringify(props.data)} FallbackComponent={ErrorInfo}>
      <FormEditor {...props} />
    </ErrorBoundary>
  );
};

export default App;
