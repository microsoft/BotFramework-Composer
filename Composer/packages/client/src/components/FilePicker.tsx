// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { AnimationClassNames, DefaultPalette } from '@uifabric/styling';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { getId } from 'office-ui-fabric-react/lib/Utilities';
import * as React from 'react';

const InputFile = styled.input({
  margin: '0px',
  outlineColor: DefaultPalette.accent,
  borderRadius: 0,
});

/**
 * Gets the general styling from the theme along with the fabric
 * sliding animations.
 */
const errorStyles = css`
  color: ${DefaultPalette.red};
`;

export type FilePickerProps = {
  /**
   * Whether the file input is required or not.
   */
  required?: boolean;
  /**
   * The label to display.
   */
  label: string;
  /**
   * A callback that gets fired when the file(s) are selected
   */
  onChange?: (files: FileList) => void;
  /**
   * An error message to display if defined.
   */
  errorMessage?: string;
  /**
   * Allows the user to select more than one file.
   */
  multiple?: boolean;
  /**
   * Defines the file types the file input should accept.
   */
  accept?: string;
};

export type FilePickerRef = {
  reset: () => void;
};

/**
 * Represents a file picker to use in forms.
 */
export const FilePicker = React.forwardRef((props: FilePickerProps, ref: React.Ref<FilePickerRef>) => {
  const { accept, multiple = false, required = false, label, errorMessage, onChange } = props;

  const inputFileRef = React.useRef<HTMLInputElement | null>(null);
  const inputId = React.useRef<string>(getId());

  React.useImperativeHandle(
    ref,
    (): FilePickerRef => ({
      reset: () => {
        inputFileRef.current?.value = '';
      },
    })
  );

  /**
   * Notifies consumer component that the file was changed.
   *
   * @param fileField The file that was selected.
   */
  const change = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { files } = e.target as HTMLInputElement;
    if (onChange && files) {
      onChange(files);
    }
  };

  return (
    <Stack gap={5}>
      <Stack gap={5}>
        <Label htmlFor={inputId.current} required={required}>
          {label}
        </Label>

        <InputFile
          ref={inputFileRef}
          accept={accept}
          id={inputId.current}
          multiple={multiple}
          type="file"
          onChange={change}
        />
      </Stack>

      <Text className={AnimationClassNames.slideDownIn20} css={errorStyles} variant="small">
        {errorMessage}
      </Text>
    </Stack>
  );
});
