import React, { useState, useEffect } from 'react';

// eslint-disable-next-line
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeMenu } from '../shared/NodeMenu';
import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { NodeColors } from '../../shared/elementColors';
import { DialogGroup } from '../../shared/appschema';

import { FormCard } from './templates/FormCard';

const isAnonymousTemplateReference = activity => {
  return activity.indexOf('bfdactivity-') !== -1;
};

export const ActivityRenderer: React.FC<NodeProps> = props => {
  const { id, data, onEvent, getLgTemplates } = props;
  const [templateText, setTemplateText] = useState('');

  const updateTemplateText = async () => {
    if (data.activity && data.$designer && data.$designer.id) {
      if (isAnonymousTemplateReference(data.activity)) {
        // this is an LG template, go get it's content
        if (!getLgTemplates || typeof getLgTemplates !== 'function') {
          setTemplateText(data.activity);
        }

        const templateName = data.activity.slice(1, data.activity.length - 1);
        const templates = await getLgTemplates('common', `${templateName}`);
        const [template] = templates.filter(template => {
          return template.name === templateName;
        });
        if (template && template.body) {
          const [firstLine] = template.body.split('\n');
          setTemplateText(firstLine.startsWith('-') ? firstLine.substring(1) : firstLine);
        }
      }
    }
  };

  useEffect(() => {
    updateTemplateText();
  });

  return (
    <FormCard
      nodeColors={NodeColors[DialogGroup.RESPONSE]}
      header={'Activity'}
      corner={<NodeMenu id={id} onEvent={onEvent} />}
      icon="MessageBot"
      label={templateText}
      onClick={() => {
        onEvent(NodeEventTypes.Focus, id);
      }}
    />
  );
};

ActivityRenderer.defaultProps = defaultNodeProps;
