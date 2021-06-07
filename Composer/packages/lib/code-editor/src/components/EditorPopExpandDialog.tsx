// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Dialog } from 'office-ui-fabric-react/lib/Dialog';
import React from 'react';

import { BaseEditorProps } from '../BaseEditor';

type Props<T extends BaseEditorProps> = T & {
  onDismiss: () => void;
  EditorComponent: React.FC<Omit<Props<T>, 'onDismiss' | 'EditorComponent' | 'popExpandOptions'>>;
};

export const EditorPopExpandDialog = <T extends BaseEditorProps>(props: Props<T>) => {
  const { popExpandOptions, onDismiss, EditorComponent, ...restProps } = props;

  return (
    <Dialog
      dialogContentProps={{ title: popExpandOptions?.popExpandTitle }}
      hidden={false}
      modalProps={{
        isBlocking: true,
        isClickableOutsideFocusTrap: true,
        styles: { main: { maxWidth: '840px !important', width: '840px !important' } },
      }}
      onDismiss={onDismiss}
    >
      <EditorComponent {...restProps} showDirectTemplateLink={false} />
    </Dialog>
  );
};
