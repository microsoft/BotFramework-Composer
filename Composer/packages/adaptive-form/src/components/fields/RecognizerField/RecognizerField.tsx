// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useCallback, useMemo, useState } from 'react';
import { FieldProps, useShellApi, useRecognizerConfig } from '@bfc/extension-client';
import { MicrosoftIRecognizer } from '@bfc/shared';
import formatMessage from 'format-message';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { CheckboxVisibility, DetailsList, SelectionMode, Selection } from 'office-ui-fabric-react/lib/DetailsList';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';

import { FieldLabel } from '../../FieldLabel';

import { useMigrationEffect } from './useMigrationEffect';
import { mapListItemsToRecognizerSchema } from './mappers';
import { getDetailsListItems } from './getDetailsListItems';

const recognizerStyle = css`
  display: flex;
  justify-content: space-between;
  margin: 5px 0px 10px 0px;
`;
const AzureBlue = '#0078D4';

export type RecognizerListItem = {
  key: string;
  text: string;
  description: string;
};
export const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = (props) => {
  const { value, id, label, description, uiOptions, required, onChange } = props;
  const { shellApi, ...shellData } = useShellApi();
  const { telemetryClient } = shellApi;
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRecognizer, setSelectedRecognizer] = useState<RecognizerListItem>();

  useMigrationEffect(value, onChange);
  const { recognizers: recognizerConfigs, currentRecognizer } = useRecognizerConfig();
  const detailsListItems = useMemo(() => getDetailsListItems(recognizerConfigs, shellData, shellApi), [
    recognizerConfigs,
  ]);

  const RecognizerEditor = currentRecognizer?.recognizerEditor;
  const widget = RecognizerEditor ? <RecognizerEditor {...props} /> : null;

  const selection = useMemo(() => {
    return new Selection({
      onSelectionChanged: () => {
        const selectedItems = selection.getSelection() as RecognizerListItem[];
        if (selectedItems?.length > 0) {
          setSelectedRecognizer(selectedItems[0]);
        }
      },
    });
  }, [setSelectedRecognizer]);

  const submit = useCallback((): void => {
    if (!selectedRecognizer) return;

    const recognizerDefinition = mapListItemsToRecognizerSchema(selectedRecognizer, recognizerConfigs);

    const seedNewRecognizer = recognizerDefinition?.seedNewRecognizer;
    const recognizerInstance =
      typeof seedNewRecognizer === 'function'
        ? seedNewRecognizer(shellData, shellApi)
        : { $kind: selectedRecognizer.key as string, intents: [] }; // fallback to default Recognizer instance;
    onChange(recognizerInstance);
    telemetryClient?.track('RecognizerChanged', { recognizer: selectedRecognizer.key as string });
  }, [selectedRecognizer, recognizerConfigs, shellData, shellApi, telemetryClient]);

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <div style={{ fontWeight: 600 }}>{formatMessage('Recognizer/Dispatch type')}</div>
      <div css={recognizerStyle} data-testid="recognizerTypeList">
        <span>
          {typeof currentRecognizer?.displayName === 'function'
            ? currentRecognizer?.displayName({})
            : currentRecognizer?.displayName}
        </span>
        <span data-testid="openRecognizerDialog" style={{ color: AzureBlue }} onClick={() => setShowDialog(true)}>
          {formatMessage('Change')}
        </span>
      </div>
      <Dialog
        dialogContentProps={{
          type: DialogType.normal,
          title: formatMessage('Choose a recognizer type'),
        }}
        hidden={!showDialog}
        minWidth={450}
        modalProps={{
          isBlocking: true,
          isClickableOutsideFocusTrap: true,
        }}
        onDismiss={() => setShowDialog(false)}
      >
        <DetailsList
          checkboxVisibility={CheckboxVisibility.always}
          columns={[
            {
              key: 'recognizer',
              name: 'Recognizer type',
              minWidth: 70,
              onRender: (item) => {
                return (
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.text}</div>
                    <div style={{ whiteSpace: 'normal' }}>{item.description}</div>
                  </div>
                );
              },
            },
          ]}
          isHeaderVisible={false}
          items={detailsListItems}
          selection={selection}
          selectionMode={SelectionMode.single}
        />
        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={() => setShowDialog(false)} />
          <PrimaryButton
            text={formatMessage('Done')}
            onClick={() => {
              setShowDialog(false);
              submit();
            }}
          />
        </DialogFooter>
      </Dialog>
      {widget}
    </React.Fragment>
  );
};
