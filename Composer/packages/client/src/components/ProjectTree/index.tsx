import React from 'react';
import { ActionButton } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { addButton, root } from './styles';
import { TreeItem } from './treeItem';

interface Link {
  id: string;
  displayName: string;
  depth: number;
  children?: Link[];
}

interface ProjectTreeProps {
  dialogs: { [key: string]: any }[];
  dialogId: string;
  selected: string;
  onAdd: () => void;
  onSelect: (id: string, selected?: string) => void;
  onDelete: () => void;
}

export const ProjectTree: React.FC<ProjectTreeProps> = props => {
  const { dialogs, onAdd, dialogId, selected, onSelect, onDelete } = props;

  return (
    <div css={root} data-testid="ProjectTree">
      <ul>
        {dialogs.map(link => {
          return (
            <li key={link.id}>
              <TreeItem
                link={link}
                depth={0}
                isActive={dialogId === link.id}
                activeNode={dialogId}
                onSelect={() => {
                  onSelect(link.id, `rules[0]`);
                }}
                onDelete={onDelete}
              />
              <ul>
                {dialogId === link.id &&
                  link.triggers.map((trigger, index) => {
                    const current = `rules[${index}]`;
                    return (
                      <li key={trigger.id}>
                        <TreeItem
                          link={trigger}
                          depth={1}
                          isActive={current === selected}
                          onSelect={() => onSelect(link.id, `rules[${index}]`)}
                          onDelete={onDelete}
                        />
                      </li>
                    );
                  })}
              </ul>
            </li>
          );
        })}
      </ul>
      <ActionButton iconProps={{ iconName: 'CircleAddition' }} css={addButton} onClick={onAdd}>
        {formatMessage('New Dialog ..')}
      </ActionButton>
    </div>
  );
};
