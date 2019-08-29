import React, { useMemo } from 'react';
import { PropTypes } from 'prop-types';
import { ActionButton } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { cloneDeep, find, filter } from 'lodash';

import { addButton, root } from './styles';
import { TreeItem } from './treeItem';

export const ProjectTree = props => {
  const { dialogs, onAdd, activeNode, onSelect, onDelete } = props;

  const links = useMemo(() => {
    if (dialogs.length === 0) return [];
    let links = cloneDeep(dialogs);
    const root = find(dialogs, dialog => dialog.isRoot);
    links = filter(dialogs, dialog => !dialog.isRoot);
    return [root, ...links];
  }, [dialogs]);

  return (
    <div css={root} data-testid="ProjectTree">
      <ul>
        {links.map(link => {
          return (
            <li key={link.id}>
              <TreeItem link={link} activeNode={activeNode} onSelect={onSelect} onDelete={onDelete} />
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

ProjectTree.propTypes = {
  dialogs: PropTypes.array,
  activeNode: PropTypes.string,
  onSelect: PropTypes.func,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
};
