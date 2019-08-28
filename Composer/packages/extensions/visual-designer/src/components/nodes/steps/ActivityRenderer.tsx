import React, { useState, useEffect, useContext } from 'react';

import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { NodeRendererContext } from '../../../store/NodeRendererContext';
import { getElementColor } from '../../../utils/obiPropertyResolver';
import { NodeMenu } from '../../menus/NodeMenu';
import { FormCard } from '../templates/FormCard';
import { NodeProps, defaultNodeProps } from '../nodeProps';
import { getFriendlyName } from '../utils';

const isAnonymousTemplateReference = activity => {
  return activity && activity.indexOf('bfdactivity-') !== -1;
};

export const ActivityRenderer: React.FC<NodeProps> = props => {
  const { getLgTemplates } = useContext(NodeRendererContext);

  const { id, data, onEvent } = props;
  const [templateText, setTemplateText] = useState('');

  const updateTemplateText = async () => {
    const isAnonActivity = isAnonymousTemplateReference(data.activity);

    if (isAnonActivity && data.$designer && data.$designer.id) {
      // this is an LG template, go get it's content
      if (!getLgTemplates || typeof getLgTemplates !== 'function') {
        setTemplateText(data.activity);
      }

      const templateName = data.activity.slice(1, data.activity.length - 1);
      const templates = getLgTemplates ? await getLgTemplates('common', `${templateName}`) : [];
      const [template] = templates.filter(template => {
        return template.Name === templateName;
      });
      if (template && template.Body) {
        const [firstLine] = template.Body.split('\n');
        setTemplateText(firstLine.startsWith('-') ? firstLine.substring(1) : firstLine);
      }
    } else if (!isAnonActivity) {
      setTemplateText(data.activity);
    }
  };

  useEffect(() => {
    updateTemplateText();
  });

  const nodeColors = getElementColor(data.$type);

  return (
    <FormCard
      nodeColors={nodeColors}
      header={getFriendlyName(data) || 'Activity'}
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
