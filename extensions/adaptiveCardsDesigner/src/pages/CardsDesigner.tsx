// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import styled from '@emotion/styled'
import { jsx } from '@emotion/core';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import formatMessage from 'format-message';
import { render, useLgApi, useProjectApi } from '@bfc/extension-client';
import * as ACDesigner from 'adaptivecards-designer';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import querystring from 'query-string';

const AdaptiveCardDesignerContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh'
});

const Library: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [lgTemplateName, setLgTemplateName] = useState('');
  const [designer, setDesigner] = useState(undefined);
  const [selectedBotKey, setSelectedBotKey] = useState<number | null>(null);

  const { projectId, projectCollection } = useProjectApi();
  const { addLgTemplate } = useLgApi(projectId);

  const ACDesignerRef = useRef(null);
  const start = '- ```\n';
  const end = '\n```';

  const handleCreateLGTemplateSubmit = () => {
    // todo: not sure how to write to a specific project's common file. gap in api?
    addLgTemplate('common', lgTemplateName, `${start}${JSON.stringify(designer?.getCard() || {}, null, 3)}${end}`);
    setShouldShowModal(false);
  };

  const handleProjectIdSelected = (_, option?: IDropdownOption) => {
    if (option) {
      const { key } = option;
      setSelectedBotKey(key as number);
    }
  };

  const botNameOptions = useMemo<IDropdownOption[]>(() => {
    setSelectedBotKey(projectCollection[0].key);
    return projectCollection.map(({ name, projectId }, key) => ({
      key,
      text: name,
      data: {
        name,
        projectId,
      },
    }));
  }, [projectCollection]);

  useEffect(() => {
    const interval = setInterval(() => {
      // @ts-ignore
      if (window.monaco) {
        clearInterval(interval);
        setIsLoaded(true);
      }
    }, 500);
  }, []);

  useEffect(() => {
    if (isLoaded && ACDesignerRef.current) {
      // @ts-ignore
      setSelectedBotKey(botNameOptions[0].key);
      const designer = new ACDesigner.CardDesigner([
        new ACDesigner.WebChatContainer('Bot Framework WebChat', 'containers/webchat-container.css'),
        new ACDesigner.WebChatContainer('Microsoft Teams (Dark)', 'containers/teams-container-dark.css'),
        new ACDesigner.WebChatContainer('Microsoft Teams (Light)', 'containers/teams-container-light.css'),
      ]);

      designer.assetPath = 'https://unpkg.com/adaptivecards-designer@latest/dist';
      const createLgButton = new ACDesigner.ToolbarButton(
        'createLgButton',
        'Create new LG template',
        'acd-icon-newCard',
        () => {
          setShouldShowModal(true);
        }
      );
      createLgButton.separator = true;

      // pluck off query string params for existing template data
      const decoded = decodeURIComponent(window.parent.location.search);
      const { templateName, templateBody } = querystring.parse(decoded);
      if (templateName && typeof templateName === 'string') {
        setLgTemplateName(templateName);
      }

      designer.sampleCatalogueUrl = `${window.location.origin}/adaptive-card-designer`;

      // todo: ??? not working
      ACDesigner.GlobalSettings.showVersionPicker = true;

      ACDesigner.GlobalSettings.enableDataBindingSupport = true;
      ACDesigner.GlobalSettings.showSampleDataEditorToolbox = true;
      ACDesigner.Strings.toolboxes.sampleDataEditor.title =
        'Data editor (use to test dynamic data binding to a template)';

      designer.toolbar.insertElementAfter(createLgButton, ACDesigner.CardDesigner.ToolbarCommands.CopyJSON);
      designer.attachTo(ACDesignerRef.current);
      designer.monacoModuleLoaded();
      if (templateBody && typeof templateBody === 'string') {
        designer.setCard(JSON.parse(templateBody));
      } // else {
      // todo: add default BF card (receive from Thomas Chung)
      //}
      setDesigner(designer);
    }
    return () => {
      setLgTemplateName('');
    };
  }, [isLoaded]);

  return (
    <React.Fragment>
      {shouldShowModal && (
        <DialogWrapper
          isOpen
          dialogType={DialogTypes.DesignFlow}
          subText={formatMessage(
            "Provide a name to be used when invoking your card. Card will be written to the selected bot's common templates"
          )}
          title={formatMessage('Create new LG Template')}
          onDismiss={() => {
            setShouldShowModal(false);
          }}
        >
          <Stack tokens={{ childrenGap: '3rem' }}>
            <StackItem grow={0}>
              <Label required>{formatMessage('Bot name')}</Label>
              <Dropdown
                disabled={projectCollection.length === 1}
                options={botNameOptions}
                selectedKey={selectedBotKey}
                onChange={handleProjectIdSelected}
              />
              <TextField
                required
                label={formatMessage('Template name')}
                value={lgTemplateName}
                onChange={(_e, value) => {
                  setLgTemplateName(value.trim());
                }}
              />
            </StackItem>

            <StackItem align={'end'}>
              <DefaultButton
                data-testid="SkillFormCancel"
                text={formatMessage('Cancel')}
                onClick={() => {
                  setShouldShowModal(false);
                }}
              />
              <PrimaryButton
                disabled={selectedBotKey === null || lgTemplateName.length === 0}
                styles={{ root: { marginLeft: '8px' } }}
                text={formatMessage('Confirm')}
                onClick={handleCreateLGTemplateSubmit}
              />
            </StackItem>
          </Stack>
        </DialogWrapper>
      )}
      <AdaptiveCardDesignerContainer>
        <div ref={ACDesignerRef} />
      </AdaptiveCardDesignerContainer>
    </React.Fragment>
  );
};

render(<Library />);
