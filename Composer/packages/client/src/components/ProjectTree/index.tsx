import React, { useMemo } from 'react';
import { ActionButton, IIconProps } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { cloneDeep } from 'lodash';

import { DialogInfo, ITrigger } from '../../store/types';
import { getFriendlyName, createSelectedPath } from '../../utils';

import { addButton, root } from './styles';
import { TreeItem } from './treeItem';

interface ProjectTreeProps {
  dialogs: DialogInfo[];
  dialogId: string;
  selected: string;
  isOpen: boolean;
  onAdd: () => void;
  onSelect: (id: string, selected?: string) => void;
  onAddTrigger: (id: string, type: string, index: number) => void;
  onDeleteDialog: (id: string) => void;
  onDeleteTrigger: (id: string, index: number) => void;
  openNewTriggerModal: () => void;
}

const addIconProps: IIconProps = {
  iconName: 'CircleAddition',
  styles: { root: { fontSize: '12px' } },
};

export const ProjectTree: React.FC<ProjectTreeProps> = props => {
  const { dialogs, onAdd, dialogId, selected, onSelect, onDeleteDialog, onDeleteTrigger, openNewTriggerModal } = props;

  const showName = (trigger: ITrigger) => {
    if (!trigger.displayName) {
      return getFriendlyName({ $type: trigger.type });
    }
    return trigger.displayName;
  };

  //put the Main to the first
  const links = useMemo<DialogInfo[]>(() => {
    const dialogsCopy = cloneDeep(dialogs);
    return dialogsCopy.reduce((result: DialogInfo[], item) => {
      if (item.isRoot) {
        result = [item, ...result];
      } else {
        result.push(item);
      }
      return result;
    }, []);
  }, [dialogs]);

  return (
    <div css={root} data-testid="ProjectTree">
      <ul>
        {links.map(link => {
          return (
            <li key={link.id}>
              <TreeItem
                link={link}
                depth={0}
                isActive={dialogId === link.id}
                activeNode={dialogId}
                onSelect={() => {
                  if (dialogId !== link.id) {
                    onSelect(link.id);
                  }
                }}
                onDelete={onDeleteDialog}
              />
              <ul>
                {dialogId === link.id &&
                  link.triggers.map((trigger, index) => {
                    const current = createSelectedPath(index);
                    trigger.displayName = showName(trigger);
                    return (
                      <li key={trigger.id}>
                        <TreeItem
                          link={trigger}
                          showName={item => showName(item)}
                          depth={1}
                          isActive={current === selected}
                          onSelect={() => onSelect(link.id, createSelectedPath(index))}
                          onDelete={() => onDeleteTrigger(link.id, index)}
                        />
                      </li>
                    );
                  })}
              </ul>
              {dialogId === link.id && (
                <ActionButton
                  data-testid="AddNewTrigger"
                  tabIndex={1}
                  iconProps={addIconProps}
                  css={addButton(1)}
                  onClick={openNewTriggerModal}
                >
                  {formatMessage('New Trigger ..')}
                </ActionButton>
              )}
            </li>
          );
        })}
      </ul>
      <ActionButton tabIndex={1} iconProps={addIconProps} css={addButton(0)} onClick={onAdd}>
        {formatMessage('New Dialog ..')}
      </ActionButton>
    </div>
  );
};
