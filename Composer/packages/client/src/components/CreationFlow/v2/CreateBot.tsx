// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useState, Fragment, useEffect, useMemo } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
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
import { BotTemplate } from '@bfc/shared';
import { DialogWrapper, DialogTypes, LoadingSpinner } from '@bfc/ui-shared';
import { NeutralColors } from '@uifabric/fluent-theme';
import { WindowLocation } from '@reach/router';
import { IPivotItemProps, Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { csharpFeedKey, nodeFeedKey } from '@botframework-composer/types';
import { useRecoilState, useRecoilValue } from 'recoil';

import msftIcon from '../../../images/msftIcon.svg';
import { DialogCreationCopy } from '../../../constants';
import { creationFlowTypeState, fetchReadMePendingState, selectedTemplateReadMeState } from '../../../recoilModel';
import TelemetryClient from '../../../telemetry/TelemetryClient';

import { TemplateDetailView } from './TemplateDetailView';

// -------------------- Styles -------------------- //

const detailListContainer = css`
  width: 48%;
  padding-right: 2%;
  height: 400px;
  overflow: hidden;
  float: left;
  flex-grow: 1;
`;

const templateDetailContainer = css`
  width: 48%;
  padding-right: 2%;
  height: 400px;
  overflow: auto;
  flex-grow: 1;
  float: left;
`;

const pickerContainer = css`
  position: relative;
  height: 400px;
  border: 1px solid #f3f2f1;
`;

const rowDetails = (disabled) => {
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

const rowTitle = (disabled) => {
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

const templateRequestUrl =
  'https://github.com/microsoft/botframework-components/issues/new?assignees=&labels=needs-triage%2C+feature-request&template=-net-sdk-feature-request.md&title=[NewTemplateRequest]';

// -------------------- CreateOptions -------------------- //
type CreateBotProps = {
  isOpen: boolean;
  templates: BotTemplate[];
  location?: WindowLocation | undefined;
  onDismiss: () => void;
  onNext: (templateName: string, templateLanguage: string, urlData?: string) => void;
  fetchTemplates: (feedUrls?: string[]) => Promise<void>;
  fetchReadMe: (moduleName: string) => {};
};

export function CreateBotV2(props: CreateBotProps) {
  const [option] = useState(optionKeys.createFromTemplate);
  const [disabled] = useState(false);
  const { isOpen, templates, onDismiss, onNext } = props;
  const [currentTemplateId, setCurrentTemplateId] = useState('');
  const [selectedProgLang, setSelectedProgLang] = useState<{ props: IPivotItemProps }>({
    props: { itemKey: csharpFeedKey },
  });
  const [displayedTemplates, setDisplayedTemplates] = useState<BotTemplate[]>([]);
  const [readMe] = useRecoilState(selectedTemplateReadMeState);
  const fetchReadMePending = useRecoilValue(fetchReadMePendingState);
  const creationFlowType = useRecoilValue(creationFlowTypeState);

  const selectedTemplate = useMemo(() => {
    return new Selection({
      onSelectionChanged: () => {
        const t = selectedTemplate.getSelection()[0] as BotTemplate;

        if (t) {
          setCurrentTemplateId(t.id);
        }
      },
    });
  }, []);

  const handleJumpToNext = () => {
    TelemetryClient.track('CreateNewBotProjectNextButton', { template: currentTemplateId });
    const runtimeLanguage = selectedProgLang?.props?.itemKey ?? csharpFeedKey;

    if (location?.search) {
      onNext(currentTemplateId, runtimeLanguage, location.search);
    } else {
      onNext(currentTemplateId, runtimeLanguage);
    }
  };

  const tableColumns = [
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
            <img
              alt={formatMessage('Microsoft Logo')}
              aria-label={formatMessage('Microsoft Logo')}
              src={msftIcon}
              style={{ marginRight: '3px', height: '12px', width: '12px', position: 'relative', top: '2px' }}
            />
            {item.name}
          </div>
        </div>
      ),
    },
  ];

  const onRenderRow = (props) => {
    if (!props) return null;
    return (
      <DetailsRow {...props} data-testid={props.item.id} styles={rowDetails(disabled)} tabIndex={props.itemIndex} />
    );
  };

  const getTemplate = (): BotTemplate | undefined => {
    const currentTemplate = displayedTemplates.find((t) => {
      return t?.id === currentTemplateId;
    });
    return currentTemplate;
  };

  useEffect(() => {
    const itemKey = selectedProgLang.props.itemKey;
    if (itemKey === csharpFeedKey) {
      const newTemplates = templates.filter((template) => {
        return template.dotnetSupport;
      });
      setDisplayedTemplates(newTemplates);
    } else if (itemKey === nodeFeedKey) {
      const newTemplates = templates.filter((template) => {
        return template.nodeSupport;
      });
      setDisplayedTemplates(newTemplates);
    }
  }, [templates, selectedProgLang]);

  useEffect(() => {
    if (displayedTemplates?.[0]?.id) {
      setCurrentTemplateId(displayedTemplates[0].id);
    }
  }, [displayedTemplates]);

  useEffect(() => {
    if (currentTemplateId) {
      props.fetchReadMe(currentTemplateId);
    }
  }, [currentTemplateId, props.fetchReadMe]);

  const dialogWrapperProps =
    creationFlowType === 'Skill' ? DialogCreationCopy.CREATE_NEW_SKILLBOT : DialogCreationCopy.CREATE_NEW_BOT_V2;

  return (
    <Fragment>
      <DialogWrapper isOpen={isOpen} {...dialogWrapperProps} dialogType={DialogTypes.CreateFlow} onDismiss={onDismiss}>
        <Pivot
          defaultSelectedKey={csharpFeedKey}
          onLinkClick={(item) => {
            if (item) {
              setSelectedProgLang(item);
            }
          }}
        >
          <PivotItem data-testid="dotnetFeed" headerText="C#" itemKey={csharpFeedKey}></PivotItem>
          <PivotItem data-testid="nodeFeed" headerText="Node" itemKey={nodeFeedKey}></PivotItem>
        </Pivot>
        <div css={pickerContainer}>
          <div css={detailListContainer} data-is-scrollable="true" id="templatePickerContainer">
            <ScrollablePane
              scrollbarVisibility={ScrollbarVisibility.auto}
              styles={{ root: { width: '100%', height: 'inherit', position: 'relative' } }}
            >
              <DetailsList
                checkboxVisibility={CheckboxVisibility.hidden}
                columns={tableColumns}
                compact={false}
                getKey={(item) => item.name}
                isHeaderVisible={false}
                items={displayedTemplates}
                layoutMode={DetailsListLayoutMode.justified}
                selection={selectedTemplate}
                selectionMode={disabled ? SelectionMode.none : SelectionMode.single}
                onRenderRow={onRenderRow}
              />
            </ScrollablePane>
          </div>
          <div css={templateDetailContainer} data-is-scrollable="true">
            {fetchReadMePending ? <LoadingSpinner /> : <TemplateDetailView readMe={readMe} template={getTemplate()} />}
          </div>
        </div>
        <DialogFooter>
          <Link href={templateRequestUrl} styles={{ root: { fontSize: '12px', float: 'left' } }} target="_blank">
            <FontIcon iconName="ChatInviteFriend" style={{ marginRight: '5px' }} />
            {formatMessage('Need another template? Send us a request')}
          </Link>
          <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
          <PrimaryButton
            data-testid="NextStepButton"
            disabled={option === optionKeys.createFromTemplate && (templates.length <= 0 || currentTemplateId === null)}
            text={formatMessage('Next')}
            onClick={handleJumpToNext}
          />
        </DialogFooter>
      </DialogWrapper>
    </Fragment>
  );
}
