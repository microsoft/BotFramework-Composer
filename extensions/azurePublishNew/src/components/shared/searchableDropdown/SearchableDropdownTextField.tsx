// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { ITextField, ITextFieldProps, TextField } from 'office-ui-fabric-react';

export type SearchableDropdownTextFieldProps = ITextFieldProps & {
  /**
   * A handy callback for when the enter key
   * is pressed.
   */
  onEnterKeyUp?: (event?: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;

  /**
   * ID for field's selection in E2E Tests.
   * HTML attribute: data-automation-id
   */
  'data-automation-id'?: string;
};

export const SearchableDropdownTextField = React.forwardRef(
  (props: SearchableDropdownTextFieldProps, tagInputFieldRef: React.MutableRefObject<ITextField>) => {
    const { onEnterKeyUp, onKeyDown, componentRef } = props;
    const { errorMessage } = props;

    /**
     * Intercepts the key up event to handle the Enter key press.
     *
     * @param event The event object that was passed with the event.
     */
    const interceptKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
      if (onEnterKeyUp && event.key === 'Enter') {
        onEnterKeyUp(event);
      }

      // Pass through the event if it was defined.
      if (onKeyDown) {
        onKeyDown(event);
      }
    };

    /**
     * The reason we wrap the errorMessage into the onGetErrorMessage function
     * is that ensures that the validation properties that the fabric library
     * support are applied. Also, error messages by our validators return undefined
     * if they succeed, while fabric's libraries validation success expects an empty string.
     */
    return (
      <TextField
        {...props}
        ariaLabel={props.ariaLabel || props.label || formatMessage('Textfield')}
        autoComplete="off"
        componentRef={tagInputFieldRef || componentRef}
        deferredValidationTime={300}
        placeholder={formatMessage('Type text here ...')}
        onGetErrorMessage={() => (errorMessage ? errorMessage : '')}
        onKeyDown={interceptKeyDown}
      />
    );
  }
);
