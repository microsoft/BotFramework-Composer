import React, { useMemo } from 'react';
import { ActionButton, IIconProps } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { cloneDeep } from 'lodash';
import { createStepMenu, DialogGroup } from 'shared-menus';

import { DialogInfo, ITrigger } from '../../store/types';
import { getFriendlyName, createSelectedPath } from '../../utils';

import { addButton, root } from './styles';
import { TreeItem } from './treeItem';

interface ProjectTreeProps {
  dialogs: DialogInfo[];
  dialogId: string;
  selected: string;
  onAdd: () => void;
  onSelect: (id: string, selected?: string) => void;
  onAddTrigger: (id: string, type: string, index: number) => void;
  onDeleteDialog: (id: string) => void;
  onDeleteTrigger: (id: string, index: number) => void;
}

const addIconProps: IIconProps = {
  iconName: 'CircleAddition',
  styles: { root: { fontSize: '12px' } },
};

const menuIconProps: IIconProps = {
  iconName: '',
};

export const ProjectTree: React.FC<ProjectTreeProps> = props => {
  const { dialogs, onAdd, dialogId, selected, onSelect, onDeleteDialog, onDeleteTrigger, onAddTrigger } = props;

  const createMenuProps = (position: number) => {
    return {
      items: createStepMenu(
        [DialogGroup.EVENTS],
        false,
        (e, item): any => onAddTrigger(dialogId, item.$type, position)
      ),
      id: 'AddNewTriggerMenu',
    };
  };

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
    <div css={root} id="ProjectTree" data-intro="U are ok" data-step="100" data-testid="ProjectTree">
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
                  id="AddNewTriggerBtn"
                  data-testid="AddNewTrigger"
                  tabIndex={1}
                  iconProps={addIconProps}
                  css={addButton(1)}
                  menuProps={createMenuProps(link.triggers.length)}
                  menuIconProps={menuIconProps}
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
