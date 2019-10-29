/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import { useContext, useState, useEffect } from 'react';

import { NodeRendererContext } from '../store/NodeRendererContext';

// matches [bfd<someName>-123456]
const TEMPLATE_PATTERN = /^\[(bfd.+-\d{6})\]$/;

const getTemplateId = (str?: string): string | null => {
  if (!str) {
    return null;
  }

  const match = TEMPLATE_PATTERN.exec(str);

  if (!match || !match[1]) {
    return null;
  }

  return match[1];
};

export const useLgTemplate = (str?: string, dialogId?: string) => {
  const { getLgTemplates } = useContext(NodeRendererContext);
  const [templateText, setTemplateText] = useState('');
  let cancelled = false;

  const updateTemplateText = async () => {
    const templateId = getTemplateId(str);

    if (templateId && dialogId) {
      // this is an LG template, go get it's content
      if (!getLgTemplates || typeof getLgTemplates !== 'function') {
        setTemplateText(str || '');
      }

      const templates = getLgTemplates ? await getLgTemplates('common', `${templateId}`) : [];
      const [template] = templates.filter(template => {
        return template.Name === templateId;
      });

      if (cancelled) {
        return;
      }

      if (template && template.Body) {
        const [firstLine] = template.Body.split('\n');
        setTemplateText(firstLine.startsWith('-') ? firstLine.substring(1) : firstLine);
      } else {
        setTemplateText('');
      }
    } else if (!templateId) {
      // fallback to str passed in
      setTemplateText(str || '');
    }
  };

  useEffect(() => {
    updateTemplateText();

    return () => {
      cancelled = true;
    };
  });

  return templateText;
};
