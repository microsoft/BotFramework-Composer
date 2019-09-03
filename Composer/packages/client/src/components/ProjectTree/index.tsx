import React, { useMemo } from 'react';
import { ActionButton, IIconProps, IContextualMenuProps, IContextualMenuItem } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { cloneDeep } from 'lodash';

import { DialogInfo, ITrigger, BotSchemas } from '../../store/types';
import { getTitle } from '../../utils';
import { NewTriggerType } from '../../constants';

import { addButton, root } from './styles';
import { TreeItem } from './treeItem';

interface ProjectTreeProps {
  dialogs: DialogInfo[];
  schemas: BotSchemas;
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
  const {
    dialogs,
    onAdd,
    dialogId,
    selected,
    onSelect,
    onDeleteDialog,
    onDeleteTrigger,
    onAddTrigger,
    schemas,
  } = props;

  const createMenuProps = (
    dialogId: string,
    index: number,
    onItemClick: (ev, item: IContextualMenuItem) => any
  ): IContextualMenuProps => {
    return {
      items: NewTriggerType.map(type => {
        const text = getTitle(type, schemas);
        return {
          key: type,
          text,
          index,
          dialogId,
          'data-testid': text,
          onClick: onItemClick,
        } as IContextualMenuItem;
      }),
    };
  };

  const showName = (trigger: ITrigger) => {
    if (!trigger.displayName) {
      return getTitle(trigger.type, schemas);
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

  const handleAddTrigger = (ev, item) => {
    onAddTrigger(item.dialogId, item.key, item.index);
  };

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
                  onSelect(link.id);
                }}
                onDelete={onDeleteDialog}
              />
              <ul>
                {dialogId === link.id &&
                  link.triggers.map((trigger, index) => {
                    const current = `events[${index}]`;
                    trigger.displayName = showName(trigger);
                    return (
                      <li key={trigger.id}>
                        <TreeItem
                          link={trigger}
                          showName={item => showName(item)}
                          depth={1}
                          isActive={current === selected}
                          onSelect={() => onSelect(link.id, `events[${index}]`)}
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
                  menuProps={createMenuProps(link.id, link.triggers.length, handleAddTrigger)}
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
