// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import moment from 'moment';
import formatMessage from 'format-message';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Icon, IIconProps } from 'office-ui-fabric-react/lib/Icon';
import React, { useState, Fragment, useMemo } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { PublishResult, PublishTarget } from '@bfc/shared';
import { CheckboxVisibility, DetailsList } from 'office-ui-fabric-react/lib/DetailsList';
import { ActionButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { SharedColors } from '@uifabric/fluent-theme';
import { FontSizes } from '@uifabric/styling';
import get from 'lodash/get';
import { List } from 'office-ui-fabric-react/lib/List';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import {
  ChoiceGroup,
  IChoiceGroupOption,
  IChoiceGroupOptionStyles,
  IChoiceGroupStyles,
} from 'office-ui-fabric-react/lib/ChoiceGroup';

import { ApiStatus } from '../../utils/publishStatusPollingUpdater';
import { PublishType } from '../../recoilModel/types';

import { PublishStatusList } from './PublishStatusList';
import { detailList, listRoot, tableView } from './styles';
import { BotPublishHistory, BotStatus } from './type';

/*
  Stack
    Bot
      - Checkbox
      - Name
      Publish Profiles
        Publish Profile
        - Radio
        - Name
        - Target
        - Edit Button
        - Delete Button
          Last Published
            - Date/Time
            - Status
            - Message
            // We should remove Comment - it is useless
    - Add Button
*/

// ---------- Styles ---------- //

const Root = styled(List)`
  margin: 15px 0 0 15px;
`;

const BotItem = styled(Stack)``;

const PublishBotCheckbox = styled(Checkbox)`
  font-size: 18px;
`;

const BotHeader = styled(Stack)``;

const BotIcon = styled(Icon)`
  margin-left: 7px;
`;

const BotName = styled(Text)`
  margin-left: 2px !important;
`;

const BotDetails = styled(Stack)`
  padding: 4px 0 0 15px;
`;

const PublishProfileChoiceGroup = styled(ChoiceGroup)`
  padding: 0 0 0 5px;
`;

const ProfileChoiceField = styled(Stack)`
  align-items: center;
  align-content: center;
  justify-items: center;
  border: 1px solid cyan;
`;

const ProfileChoiceLabel = styled(Stack)`
  margin-left: 25px !important;
  align-items: flex-start;
`;

const ProfileHeader = styled(Stack)`
  align-items: center;
`;

const ProfileIcon = styled(Icon)`
  margin-left: 7px !important;
`;

const ProfileName = styled(Text)`
  margin-left: 4px !important;
  line-height: 24px;
`;

const EditProfileAction = styled(IconButton)`
  margin-left: 5px !important;
  font-size: 10px;
  line-height: 10px;
  height: 24px;
  width: 32px;
  opacity: 0;
  transition: opacity 300ms;
`;

const DeleteProfileAction = styled(IconButton)`
  margin-left: 5px !important;
  font-size: 10px;
  line-height: 10px;
  height: 24px;
  width: 32px;
  opacity: 0;
  transition: opacity 300ms;
`;

const AddProfileAction = styled(ActionButton)`
  margin: 10px 0 0 0 !important;
  font-size: 12px;
`;

const ProfileType = styled(Text)`
  color: gray;
  font-size: 12px;
`;

const ProfileDetails = styled(Stack)`
  margin-left: 15px;
`;

const profileChoiceGroupStyles: IChoiceGroupOptionStyles = {
  field: {
    selectors: {
      '::before': {
        marginTop: '2px',
      },
      '::after': {
        marginTop: '2px',
      },
    },
  },
  choiceFieldWrapper: {
    selectors: {
      ':hover': {
        selectors: {
          '.edit-profile-action, .delete-profile-action': {
            opacity: '1',
          },
        },
      },
    },
  },
};

const addProfileIcon: IIconProps = { iconName: 'Add' };
const editProfileIcon: IIconProps = { iconName: 'Edit' };
const deleteProfileIcon: IIconProps = { iconName: 'Delete' };

// ---------- BotStatusList Component ---------- //

export type BotStatusListProps = {
  botStatusList: BotStatus[];
  botPublishHistoryList: BotPublishHistory;
  publishTypes: PublishType[];

  /** When set to true, disable the checkbox. */
  disableCheckbox: boolean;
  onManagePublishProfile: (skillId: string) => void;
  checkedIds: string[];
  onCheck: (skillIds: string[]) => void;
  onChangePublishTarget: (PublishTarget: string, item: BotStatus) => void;
  onRollbackClick: (selectedVersion: PublishResult, item: BotStatus) => void;

  onAddProfile: (skillId: string) => void;
  onEditProfile: (skillId: string, publishTarget: PublishTarget) => void;
  onDeleteProfile: (skillId: string, publishTarget: PublishTarget) => void;
};

export const BotStatusList: React.FC<BotStatusListProps> = ({
  botStatusList,
  botPublishHistoryList,
  publishTypes,
  disableCheckbox,
  checkedIds,
  onAddProfile,
  onEditProfile,
  onDeleteProfile,
  onCheck,
  onManagePublishProfile,
  onChangePublishTarget,
  onRollbackClick,
}) => {
  const [expandedBotIds, setExpandedBotIds] = useState<Record<string, boolean>>({});
  const [currentSort, setSort] = useState({ key: 'Bot', descending: true });

  const displayedItems: BotStatus[] = useMemo(() => {
    if (currentSort.key !== 'Bot') return botStatusList;
    if (currentSort.descending) return botStatusList;
    return botStatusList.slice().reverse();
  }, [botStatusList, currentSort]);

  const getPublishTargetOptions = (item: BotStatus): IDropdownOption[] => {
    const options: IDropdownOption[] = [];
    item.publishTargets &&
      item.publishTargets.forEach((target) => {
        options.push({
          key: target.name,
          text: target.name,
        });
      });
    options.push({
      key: 'manageProfiles',
      text: formatMessage('Manage profiles'),
      data: { style: { color: '#0078D4' } },
    });
    return options;
  };

  const onChangeCheckbox = React.useCallback(
    (skillId: string, isChecked?: boolean) => {
      if (isChecked) {
        if (!checkedIds.some((id) => id === skillId)) {
          onCheck([...checkedIds, skillId]);
        }
      } else {
        onCheck(checkedIds.filter((id) => id !== skillId));
      }
    },
    [checkedIds]
  );

  const handleChangePublishTarget = (item: BotStatus, option?: IDropdownOption): void => {
    if (option) {
      if (option.key === 'manageProfiles') {
        onManagePublishProfile(item.id);
      } else {
        onChangePublishTarget(option.text, item);
      }
    }
  };

  const onChangeShowHistoryBots = (item: BotStatus) => {
    const clickedBotId = item.id;
    if (expandedBotIds[clickedBotId]) {
      setExpandedBotIds({ ...expandedBotIds, [clickedBotId]: false });
    } else {
      setExpandedBotIds({ ...expandedBotIds, [clickedBotId]: true });
    }
  };

  const renderDropdownOption = (option?: IDropdownOption): JSX.Element | null => {
    if (!option) return null;
    const style = {
      ...option.data?.style,
      width: '80%',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    };
    return <div style={style}>{option.text}</div>;
  };

  const renderPublishStatus = (item: BotStatus): JSX.Element | null => {
    if (!item.status) {
      return null;
    } else if (item.status === ApiStatus.Success) {
      return <Icon iconName="Accept" style={{ color: SharedColors.green10, fontWeight: 600 }} />;
    } else if (item.status === ApiStatus.Publishing) {
      return (
        <div style={{ display: 'flex' }}>
          <Spinner size={SpinnerSize.small} />
        </div>
      );
    } else {
      return <Icon iconName="Cancel" style={{ color: SharedColors.red10, fontWeight: 600 }} />;
    }
  };

  const columns = [
    {
      key: 'Bot',
      name: formatMessage('Bot'),
      className: 'publishName',
      fieldName: 'name',
      minWidth: 100,
      maxWidth: 200,
      isRowHeader: true,
      data: 'string',
      onRender: (item: BotStatus) => {
        return (
          <Checkbox
            disabled={disableCheckbox}
            label={item.name}
            styles={{
              label: { width: '100%' },
              text: {
                width: 'calc(100% - 25px)',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              },
            }}
            onChange={(_, isChecked) => onChangeCheckbox(item.id, isChecked)}
          />
        );
      },
      isPadded: true,
    },
    {
      key: 'PublishTarget',
      name: formatMessage('Publish target'),
      className: 'publishTarget',
      fieldName: 'target',
      minWidth: 100,
      maxWidth: 200,
      isRowHeader: true,
      data: 'string',
      onRender: (item: BotStatus) => {
        return (
          <Dropdown
            defaultSelectedKey={item.publishTarget}
            options={getPublishTargetOptions(item)}
            placeholder={formatMessage('Select a publish target')}
            styles={{
              root: { width: '100%' },
              dropdownItems: { selectors: { '.ms-Button-flexContainer': { width: '100%' } } },
            }}
            onChange={(_, option?: IDropdownOption) => handleChangePublishTarget(item, option)}
            onRenderOption={renderDropdownOption}
          />
        );
      },
      isPadded: true,
    },
    {
      key: 'PublishDate',
      name: formatMessage('Date'),
      className: 'publishDate',
      fieldName: 'date',
      minWidth: 114,
      maxWidth: 134,
      isRowHeader: true,
      data: 'string',
      onRender: (item: BotStatus) => {
        return <span>{item.time ? moment(item.time).format('MM-DD-YYYY') : null}</span>;
      },
      isPadded: true,
    },
    {
      key: 'PublishStatus',
      name: formatMessage('Status'),
      className: 'publishStatus',
      fieldName: 'status',
      minWidth: 114,
      maxWidth: 134,
      isRowHeader: true,
      data: 'string',
      onRender: (item: BotStatus) => {
        return renderPublishStatus(item);
      },
      isPadded: true,
    },
    {
      key: 'PublishMessage',
      name: formatMessage('Message'),
      className: 'publishMessage',
      fieldName: 'message',
      minWidth: 150,
      maxWidth: 300,
      isRowHeader: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: BotStatus) => {
        return <span>{item.message}</span>;
      },
      isPadded: true,
    },
    {
      key: 'PublishComment',
      name: formatMessage('Comment'),
      className: 'comment',
      fieldName: 'comment',
      minWidth: 150,
      maxWidth: 300,
      isRowHeader: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: BotStatus) => {
        return <span>{item.comment}</span>;
      },
      isPadded: true,
    },
    {
      key: 'ShowPublishHistory',
      name: '',
      className: 'showHistory',
      fieldName: 'showHistory',
      minWidth: 150,
      maxWidth: 300,
      isRowHeader: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: BotStatus) => {
        return (
          <IconButton
            iconProps={{ iconName: expandedBotIds[item.id] ? 'ChevronDown' : 'ChevronRight' }}
            styles={{ root: { float: 'right' } }}
            onClick={() => onChangeShowHistoryBots(item)}
          />
        );
      },
      isPadded: true,
    },
  ];

  const renderTableRow = (props, defaultRender) => {
    const { item }: { item: BotStatus } = props;
    const publishStatusList: PublishResult[] = get(botPublishHistoryList, [item.id, item.publishTarget || ''], []);
    const handleRollbackClick = (selectedVersion) => {
      onRollbackClick(selectedVersion, item);
    };
    return (
      <Fragment>
        {defaultRender(props)}
        <div css={{ display: expandedBotIds[item.id] ? 'block' : 'none', margin: '20px 0 38px 12px' }}>
          <div css={{ fontSize: '14px', lineHeight: '20px', color: '#323130', fontWeight: 'bold' }}>
            Publish history
          </div>
          {publishStatusList.length === 0 ? (
            <div style={{ fontSize: FontSizes.small, margin: '20px 0 0 50px' }}>No publish history</div>
          ) : (
            <PublishStatusList
              isRollbackSupported={false}
              items={publishStatusList}
              onRollbackClick={handleRollbackClick}
            />
          )}
        </div>
      </Fragment>
    );
  };

  const renderProfileChoiceLabel = (botStatus: BotStatus, publishTarget: PublishTarget) => {
    const targetType = publishTypes.find((pt) => publishTarget.type === pt.name)?.description || publishTarget.type;
    return (
      <ProfileChoiceLabel>
        <ProfileHeader horizontal>
          <ProfileIcon iconName="CloudUpload" />
          <ProfileName>{publishTarget.name}</ProfileName>
          <EditProfileAction
            className="edit-profile-action"
            iconProps={editProfileIcon}
            title={formatMessage('Edit')}
            onClick={() => onEditProfile(botStatus.id, publishTarget)}
          />
          <DeleteProfileAction
            className="delete-profile-action"
            iconProps={deleteProfileIcon}
            title={formatMessage('Delete')}
            onClick={() => onDeleteProfile(botStatus.id, publishTarget)}
          />
        </ProfileHeader>
        <ProfileDetails>
          <ProfileType>{targetType}</ProfileType>
        </ProfileDetails>
      </ProfileChoiceLabel>
    );
  };

  const renderBotCheckboxLabel = (botStatus: BotStatus) => {
    return (
      <Fragment>
        <BotIcon iconName="CubeShape" />
        <BotName>{botStatus.name}</BotName>
      </Fragment>
    );
  };

  const renderBotListItem = (botStatus: BotStatus): React.ReactNode => {
    const isChecked = checkedIds?.some((id) => id === botStatus.id);
    const profileOptions: IChoiceGroupOption[] = botStatus.publishTargets
      ? botStatus.publishTargets.map((p) => {
          return {
            key: p.name,
            text: p.name,
            styles: profileChoiceGroupStyles,
            // onRenderField: (props, defaultRender) => renderProfileChoiceField(props, defaultRender),
            onRenderLabel: () => renderProfileChoiceLabel(botStatus, p),
          };
        })
      : [];

    return (
      <BotItem key={botStatus.id}>
        <BotHeader horizontal>
          <PublishBotCheckbox
            checked={isChecked}
            label={botStatus.name}
            onChange={(_, isChecked) => onChangeCheckbox(botStatus.id, isChecked)}
            onRenderLabel={() => renderBotCheckboxLabel(botStatus)}
          />
        </BotHeader>
        <BotDetails>
          <PublishProfileChoiceGroup disabled={!isChecked} options={profileOptions} />
          <AddProfileAction iconProps={addProfileIcon} onClick={() => onAddProfile(botStatus.id)}>
            {formatMessage('Add Publishing Profile')}
          </AddProfileAction>
        </BotDetails>
      </BotItem>
    );
  };

  return (
    <Fragment>
      <Root items={botStatusList.slice()} onRenderCell={(item) => renderBotListItem(item as BotStatus)} />
      <div css={listRoot} data-testid={'bot-status-list'}>
        <div css={tableView}>
          <DetailsList
            isHeaderVisible
            checkboxVisibility={CheckboxVisibility.hidden}
            columns={columns.map((col) => ({
              ...col,
              isSorted: col.key === currentSort.key,
              isSortedDescending: currentSort.descending,
            }))}
            css={detailList}
            items={displayedItems}
            styles={{ root: { selectors: { '.ms-DetailsRow-fields': { display: 'flex', alignItems: 'center' } } } }}
            onColumnHeaderClick={(_, clickedCol) => {
              if (!clickedCol) return;
              if (clickedCol.key === currentSort.key) {
                clickedCol.isSortedDescending = !currentSort.descending;
                setSort({ key: clickedCol.key, descending: !currentSort.descending });
              } else {
                clickedCol.isSorted = false;
              }
            }}
            onRenderRow={renderTableRow}
          />
        </div>
      </div>
    </Fragment>
  );
};
