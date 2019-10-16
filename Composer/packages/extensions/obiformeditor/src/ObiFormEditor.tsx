import React, { useMemo } from 'react';
import ErrorBoundary, { FallbackProps } from 'react-error-boundary';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import debounce from 'lodash.debounce';
import get from 'lodash.get';

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

const ObiFormEditor: React.FC<FormEditorProps> = props => {
  const onChange = data => {
    props.onChange(data, props.focusedSteps[0]);
  };

  // only need to debounce the change handler when focusedSteps change
  const debouncedOnChange = useMemo(() => debounce(onChange, 750), [props.focusedSteps[0]]);
  const key = get(props.data, '$designer.id', props.focusPath);

  return (
    <ErrorBoundary key={key} FallbackComponent={ErrorInfo}>
      <FormEditor {...props} onChange={debouncedOnChange} />
    </ErrorBoundary>
  );
};

export default ObiFormEditor;
