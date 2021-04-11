// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { LgFile, LgTemplate, render, useLgApi } from '@bfc/extension-client';
import * as ACDesigner from 'adaptivecards-designer';
import querystring from 'query-string';
import { LoadingSpinner } from '@bfc/ui-shared';

import { CreateTemplateModal } from './CreateTemplateModal';
import { getAdaptiveCard, toCardJson } from './utils';
import { ParsedLgTemplate } from './types';
import { useLgFiles } from './useLgFiles';

const AdaptiveCardDesignerContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
});

ACDesigner.GlobalSettings.showDataStructureToolbox = false;
ACDesigner.GlobalSettings.showVersionPicker = true;
ACDesigner.GlobalSettings.enableDataBindingSupport = true;
ACDesigner.GlobalSettings.showSampleDataEditorToolbox = true;
ACDesigner.Strings.toolboxes.sampleDataEditor.title = 'Data editor (use to test dynamic data binding to a template)';

const getTemplate = (lgFiles: LgFile[]): { template?: LgTemplate; lgFileId?: string } => {
  const decoded = decodeURIComponent(window.parent.location.search);
  const { templateName, lgFileId } = querystring.parse(decoded);
  const lgTemplateName = Array.isArray(templateName) ? templateName[0] : templateName;
  const fileId = Array.isArray(lgFileId) ? lgFileId[0] : lgFileId;

  const lgFile = lgFiles.find(({ id }) => id === fileId);
  const template = lgFile?.templates.find(({ name }) => name === lgTemplateName);

  return { template, lgFileId: lgFile?.id };
};

const defaultAdaptiveCard = {};

const Library: React.FC = () => {
  const ACDesignerRef = useRef(null);
  const { lgFilesStatus, lgFiles } = useLgFiles();
  const { updateLgTemplate } = useLgApi();

  const [monacoStatus, setMonacoStatus] = useState<'loading' | 'loaded'>('loading');
  const [designer, setDesigner] = useState<ACDesigner.CardDesigner>();
  const [lgFileId, setLgFileId] = useState<string>();
  const [selectedTemplate, setSelectedTemplate] = useState<ParsedLgTemplate | undefined>();

  useEffect(() => {
    const interval = setInterval(() => {
      // @ts-ignore
      if (window.monaco) {
        clearInterval(interval);
        setMonacoStatus('loaded');
      }
    }, 500);
  }, []);

  useEffect(() => {
    if (monacoStatus === 'loaded' && lgFilesStatus === 'loaded' && ACDesignerRef.current) {
      const designer = new ACDesigner.CardDesigner(ACDesigner.defaultMicrosoftHosts);

      designer.assetPath = 'https://unpkg.com/adaptivecards-designer@latest/dist';
      designer.attachTo(ACDesignerRef.current);
      designer.monacoModuleLoaded();

      try {
        const { template, lgFileId } = getTemplate(lgFiles);
        const body = getAdaptiveCard(template.body);

        if (body?.type === 'AdaptiveCard') {
          setSelectedTemplate({ ...template, body });
          setLgFileId(lgFileId);
          designer.setCard(body);
        } else {
          throw Error('Template is not an Adaptive Card');
        }
      } catch (error) {
        designer.setCard(defaultAdaptiveCard);
      }

      // designer.sampleCatalogueUrl = `${window.location.origin}/adaptive-card-designer`;

      setDesigner(designer);
    }
  }, [monacoStatus, lgFilesStatus]);

  useEffect(() => {
    if (designer) {
      designer.onCardPayloadChanged = (cardDesigner: ACDesigner.CardDesigner) => {
        if (selectedTemplate?.name && lgFileId) {
          const card = cardDesigner.getCard();
          updateLgTemplate(lgFileId, selectedTemplate.name, toCardJson(card));
        }
      };
    }
  }, [designer, lgFileId, selectedTemplate?.name, updateLgTemplate]);

  const onSelectTemplate = useCallback(
    (template: ParsedLgTemplate) => {
      designer?.setCard(template.body);
      setSelectedTemplate(template);
    },
    [designer, lgFileId]
  );

  const onSelectLgFile = useCallback((fileId: string) => {
    setLgFileId(fileId);
  }, []);

  return (
    <AdaptiveCardDesignerContainer>
      {monacoStatus === 'loading' || lgFilesStatus === 'loading' ? (
        <LoadingSpinner />
      ) : (
        <React.Fragment>
          <div ref={ACDesignerRef} />
          <CreateTemplateModal
            hidden={!!selectedTemplate}
            onSelectLgFile={onSelectLgFile}
            onSelectTemplate={onSelectTemplate}
          />
        </React.Fragment>
      )}
    </AdaptiveCardDesignerContainer>
  );
};

render(<Library />);
