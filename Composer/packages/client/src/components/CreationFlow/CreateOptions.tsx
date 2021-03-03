// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useState, Fragment, useEffect, useMemo } from 'react';
import find from 'lodash/find';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Selection } from 'office-ui-fabric-react/lib/DetailsList';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  CheckboxVisibility,
  DetailsRow,
} from 'office-ui-fabric-react/lib/DetailsList';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { BotTemplate, QnABotTemplateId } from '@bfc/shared';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { NeutralColors } from '@uifabric/fluent-theme';
import { RouteComponentProps, navigate } from '@reach/router';
import { useRecoilValue } from 'recoil';
import { mergeStyles } from 'office-ui-fabric-react/lib/Styling';
import querystring from 'query-string';
import axios from 'axios';

import { DialogCreationCopy, EmptyBotTemplateId } from '../../constants';
import { creationFlowTypeState } from '../../recoilModel';
import TelemetryClient from '../../telemetry/TelemetryClient';
import { getAliasFromPayload } from '../../utils/electronUtil';

// -------------------- Styles -------------------- //

const optionIcon = (checked: boolean) => css`
  vertical-align: text-bottom;
  font-size: 18px;
  margin-right: 10px;
  color: ${checked ? '#0078d4' : '#000'};
`;

const optionRoot = css`
  width: 100%;
  height: 100%;
`;

const detailListContainer = css`
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
  flex-grow: 1;
`;

const listHeader = css`
  margin-top: 10px;
  margin-bottom: 0;
`;

export const bannerClass = mergeStyles({
  marginTop: '5px',
});

const rowDetails = (disabled: boolean) => {
  return {
    root: {
      color: disabled ? NeutralColors.gray80 : NeutralColors.black,
      selectors: {
        '&:hover': {
          background: disabled ? NeutralColors.white : NeutralColors.gray30,
          color: disabled ? NeutralColors.gray80 : NeutralColors.black,
        },
        '&.ms-DetailsRow.is-selected': {
          background: disabled ? NeutralColors.white : NeutralColors.gray30,
          color: disabled ? NeutralColors.gray80 : NeutralColors.black,
        },
      },
    },
  };
};

const rowTitle = (disabled: boolean) => {
  return {
    cellTitle: {
      color: disabled ? NeutralColors.gray80 : NeutralColors.black,
      selectors: {
        ':hover': {
          background: disabled ? NeutralColors.white : NeutralColors.gray30,
          color: disabled ? NeutralColors.gray80 : NeutralColors.black,
        },
      },
    },
  };
};

const tableCell = css`
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
  }
`;

const content = css`
  outline: none;
`;

const optionKeys = {
  createFromScratch: 'createFromScratch',
  createFromQnA: 'createFromQnA',
  createFromTemplate: 'createFromTemplate',
};

// -------------------- CreateOptions -------------------- //
type CreateOptionsProps = {
  templates: BotTemplate[];
  onDismiss: () => void;
  onNext: (data: string) => void;
} & RouteComponentProps<{}>;

export function CreateOptions(props: CreateOptionsProps) {
  const [option, setOption] = useState(optionKeys.createFromScratch);
  const [disabled, setDisabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { templates, onDismiss, onNext } = props;
  const [currentTemplate, setCurrentTemplate] = useState('');
  const [emptyBotKey, setEmptyBotKey] = useState('');
  const creationFlowType = useRecoilValue(creationFlowTypeState);

  const selection = useMemo(() => {
    return new Selection({
      onSelectionChanged: () => {
        const t = selection.getSelection()[0] as BotTemplate;
        if (t) {
          setCurrentTemplate(t.id);
        }
      },
    });
  }, []);

  function SelectOption(props?: { checked?: boolean; text: string; key: string }) {
    if (props == null) return null;
    const { checked, text, key } = props;
    return (
      <div key={key} css={optionRoot}>
        <Icon css={optionIcon(checked ?? false)} iconName={checked ? 'CompletedSolid' : 'RadioBtnOff'} />
        <span>{text}</span>
      </div>
    );
  }

  const handleChange = (event, option?: IChoiceGroupOption) => {
    if (option == null) return;
    setOption(option.key);
    if (option.key === optionKeys.createFromTemplate) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  };

  const handleJumpToNext = () => {
    let routeToTemplate = emptyBotKey;
    if (option === optionKeys.createFromTemplate) {
      routeToTemplate = currentTemplate;
      TelemetryClient.track('CreateNewBotProjectFromExample', { template: routeToTemplate });
    }

    if (option === optionKeys.createFromQnA) {
      routeToTemplate = QnABotTemplateId;
    }
    if (props.location?.search) {
      routeToTemplate += props.location.search;
    }

    TelemetryClient.track('CreateNewBotProjectNextButton', { template: routeToTemplate });
    onNext(routeToTemplate);
  };

  const tableColums = [
    {
      key: 'name',
      name: formatMessage('Name'),
      fieldName: 'name',
      minWidth: 150,
      maxWidth: 200,
      isResizable: !disabled,
      data: 'string',
      styles: rowTitle(disabled),
      onRender: (item) => (
        <div data-is-focusable css={tableCell}>
          <div css={content} tabIndex={-1}>
            {item.name}
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      name: formatMessage('Description'),
      fieldName: 'dateModifiedValue',
      minWidth: 200,
      maxWidth: 450,
      isResizable: !disabled,
      data: 'string',
      styles: rowTitle(disabled),
      onRender: (item) => (
        <div data-is-focusable css={tableCell}>
          <div css={content} tabIndex={-1}>
            {item.description}
          </div>
        </div>
      ),
    },
  ];

  const onRenderDetailsHeader = (props, defaultRender) => {
    return (
      <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
        {defaultRender({
          ...props,
        })}
      </Sticky>
    );
  };
  const onRenderRow = (props) => {
    if (props) {
      return (
        <DetailsRow {...props} data-testid={props.item.id} styles={rowDetails(disabled)} tabIndex={props.itemIndex} />
      );
    }
    return null;
  };

  useEffect(() => {
    if (templates.length > 1) {
      const emptyBotTemplate = find(templates, ['id', EmptyBotTemplateId]);
      if (emptyBotTemplate) {
        setCurrentTemplate(emptyBotTemplate.id);
        setEmptyBotKey(emptyBotTemplate.id);
      }
    }
  }, [templates]);

  useEffect(() => {
    // open bot directly if alias exist.
    if (props.location?.search) {
      const decoded = decodeURIComponent(props.location.search);
      const { source, payload } = querystring.parse(decoded);
      if (typeof source === 'string' && typeof payload === 'string') {
        const alias = getAliasFromPayload(source, payload);
        // check to see if Composer currently has a bot project corresponding to the alias
        axios
          .get<any>(`/api/projects/alias/${alias}`)
          .then((aliasRes) => {
            if (aliasRes.status === 200) {
              navigate(`/bot/${aliasRes.data.id}`);
              return;
            }
          })
          .catch((e) => {
            setIsOpen(true);
          });
        return;
      }
    }
    setIsOpen(true);
  }, [props.location?.search]);

  const choiceOptions = [
    {
      ariaLabel: formatMessage('Create from scratch') + (option === optionKeys.createFromScratch ? ' selected' : ''),
      key: optionKeys.createFromScratch,
      'data-testid': 'Create from scratch',
      text: formatMessage('Create from scratch'),
      onRenderField: SelectOption,
    },
    {
      ariaLabel: formatMessage('Create from QnA') + (option === optionKeys.createFromQnA ? ' selected' : ''),
      key: optionKeys.createFromQnA,
      'data-testid': 'Create from QnA',
      text: formatMessage('Create from knowledge base (QnA Maker)'),
      onRenderField: SelectOption,
    },
    {
      ariaLabel: formatMessage('Create from template') + (option === optionKeys.createFromTemplate ? ' selected' : ''),
      key: optionKeys.createFromTemplate,
      'data-testid': 'Create from template',
      text: formatMessage('Create from template'),
      onRenderField: SelectOption,
    },
  ];

  const choiceGroupTitle = creationFlowType === 'Skill' ? '' : formatMessage('Choose how to create your bot');
  const dialogWrapperProps =
    creationFlowType === 'Skill' ? DialogCreationCopy.CREATE_NEW_SKILLBOT : DialogCreationCopy.CREATE_NEW_BOT;
  return (
    <Fragment>
      <DialogWrapper isOpen={isOpen} {...dialogWrapperProps} dialogType={DialogTypes.CreateFlow} onDismiss={onDismiss}>
        <ChoiceGroup label={choiceGroupTitle} options={choiceOptions} selectedKey={option} onChange={handleChange} />
        <h3 css={listHeader}>{formatMessage('Examples')}</h3>
        <div css={detailListContainer} data-is-scrollable="true">
          <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
            <DetailsList
              isHeaderVisible
              checkboxVisibility={CheckboxVisibility.hidden}
              columns={tableColums}
              compact={false}
              getKey={(item) => item.name}
              items={templates}
              layoutMode={DetailsListLayoutMode.justified}
              selection={selection}
              selectionMode={disabled ? SelectionMode.none : SelectionMode.single}
              onRenderDetailsHeader={onRenderDetailsHeader}
              onRenderRow={onRenderRow}
            />
          </ScrollablePane>
        </div>
        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
          <PrimaryButton
            data-testid="NextStepButton"
            disabled={option === optionKeys.createFromTemplate && (templates.length <= 0 || currentTemplate === null)}
            text={formatMessage('Next')}
            onClick={handleJumpToNext}
          />
        </DialogFooter>
      </DialogWrapper>
    </Fragment>
  );
}
