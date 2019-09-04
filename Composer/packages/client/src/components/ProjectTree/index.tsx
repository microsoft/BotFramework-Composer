import React, { useMemo, useContext, useState } from 'react';
import { ActionButton, IIconProps } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { cloneDeep, get } from 'lodash';

import { DialogInfo, ITrigger, BotSchemas } from '../../store/types';
import { getTitle } from '../../utils';

//import { NewTriggerType } from '../../constants';
import { TriggerCreationModel } from './triggerCreationModel';
import { addButton, root } from './styles';
import { TreeItem } from './treeItem';
import { StoreContext } from './../../store';
interface ProjectTreeProps {
  dialogs: DialogInfo[];
  schemas: BotSchemas;
  dialogId: string;
  selected: string;
  onAdd: () => void;
  onSelect: (id: string, selected?: string) => void;
  onDeleteDialog: (id: string) => void;
  onDeleteTrigger: (id: string, index: number) => void;
}

const addIconProps: IIconProps = {
  iconName: 'CircleAddition',
  styles: { root: { fontSize: '12px' } },
};

export const ProjectTree: React.FC<ProjectTreeProps> = props => {
  const { dialogs, onAdd, dialogId, selected, onSelect, onDeleteDialog, onDeleteTrigger, schemas } = props;
  const { actions } = useContext(StoreContext);
  const [openNewTriggerModel, setopenNewTriggerModel] = useState(false);
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

  const OnTriggerCreationDisMiss = () => {
    setopenNewTriggerModel(false);
  };

  const OnTriggerCreationSubmit = dialog => {
    const payload = {
      id: dialog.id,
      content: dialog.content,
    };
    const index = get(dialog, 'content.rules', []).length - 1;
    actions.selectTo(`rules[${index}]`);
    actions.updateDialog(payload);
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
                  if (dialogId !== link.id) {
                    onSelect(link.id);
                  }
                }}
                onDelete={onDeleteDialog}
              />
              <ul>
                {dialogId === link.id &&
                  link.triggers.map((trigger, index) => {
                    const current = `rules[${index}]`;
                    trigger.displayName = showName(trigger);
                    return (
                      <li key={trigger.id}>
                        <TreeItem
                          link={trigger}
                          showName={item => showName(item)}
                          depth={1}
                          isActive={current === selected}
                          onSelect={() => onSelect(link.id, `rules[${index}]`)}
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
                  onClick={() => setopenNewTriggerModel(true)}
                >
                  {formatMessage('New Trigger ..')}
                </ActionButton>
              )}
            </li>
          );
        })}
      </ul>
      {openNewTriggerModel && (
        <TriggerCreationModel
          dialogId={dialogId}
          isOpen={openNewTriggerModel}
          onDismiss={OnTriggerCreationDisMiss}
          onSubmit={OnTriggerCreationSubmit}
        />
      )}
      <ActionButton tabIndex={1} iconProps={addIconProps} css={addButton(0)} onClick={onAdd}>
        {formatMessage('New Dialog ..')}
      </ActionButton>
    </div>
  );
};
