// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { LgTemplate, render, useLgApi } from '@bfc/extension-client';
import * as ACDesigner from 'adaptivecards-designer';
import querystring from 'query-string';

import { CreateTemplateModal } from './CreateTemplateModal';
import { useLgTemplates } from './useLgTemplates';
import { getAdaptiveCard, toCardJson } from './utils';
import { ParsedLgTemplate } from './types';
import { LoadingSpinner } from '@bfc/ui-shared';

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

const getTemplate = (templates: LgTemplate[]): LgTemplate => {
  const decoded = decodeURIComponent(window.parent.location.search);
  const { templateName } = querystring.parse(decoded);
  const lgTemplateName = Array.isArray(templateName) ? templateName[0] : templateName;
  return templates.find(({ name }) => name === lgTemplateName);
};

const defaultAdaptiveCard = {};

const Library: React.FC = () => {
  const ACDesignerRef = useRef(null);
  const { updateLgTemplate } = useLgApi();
  const { status: templatesStatus, lgTemplates } = useLgTemplates();

  const [monacoStatus, setMonacoStatus] = useState<'loading' | 'loaded'>('loading');
  const [designer, setDesigner] = useState<ACDesigner.CardDesigner>();
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
    if (monacoStatus === 'loaded' && templatesStatus === 'loaded' && ACDesignerRef.current) {
      const designer = new ACDesigner.CardDesigner(ACDesigner.defaultMicrosoftHosts);

      designer.assetPath = 'https://unpkg.com/adaptivecards-designer@latest/dist';
      designer.attachTo(ACDesignerRef.current);
      designer.monacoModuleLoaded();

      try {
        const template = getTemplate(lgTemplates);
        const body = getAdaptiveCard(template.body);
        if (body?.type === 'AdaptiveCard') {
          setSelectedTemplate({ ...template, body });
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
  }, [monacoStatus, templatesStatus, lgTemplates]);

  useEffect(() => {
    if (designer) {
      designer.onCardPayloadChanged = (cardDesigner: ACDesigner.CardDesigner) => {
        if (selectedTemplate?.name) {
          const card = cardDesigner.getCard();
          updateLgTemplate('common', selectedTemplate.name, toCardJson(card));
        }
      };
    }
  }, [designer, selectedTemplate?.name, updateLgTemplate]);

  const onSelectTemplate = useCallback(
    (template: ParsedLgTemplate) => {
      designer?.setCard(template.body);
      setSelectedTemplate(template);
    },
    [designer]
  );

  return (
    <AdaptiveCardDesignerContainer>
      {monacoStatus === 'loading' || templatesStatus === 'loading' ? (
        <LoadingSpinner />
      ) : (
        <React.Fragment>
          <div ref={ACDesignerRef} />
          <CreateTemplateModal hidden={!!selectedTemplate} onSelectTemplate={onSelectTemplate} />
        </React.Fragment>
      )}
    </AdaptiveCardDesignerContainer>
  );
};

render(<Library />);
