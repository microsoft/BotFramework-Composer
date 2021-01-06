// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { FontSizes } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Icon, IIconStyleProps, IIconStyles } from 'office-ui-fabric-react/lib/Icon';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { ISearchBoxProps, ISearchBoxStyles, SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { classNamesFunction } from 'office-ui-fabric-react/lib/Utilities';
import * as React from 'react';

import { colors } from '../../constants';

const TitleBar = styled(Stack)({
  flex: 1,
  height: 45,
});

const helpIconStyles = classNamesFunction<IIconStyleProps, IIconStyles>()({
  root: {
    width: '16px',
    minWidth: '16px',
    height: '16px',
    color: colors.gray160,
    fontSize: FontSizes.size12,
    marginBottom: '-2px',
    paddingLeft: '4px',
    paddingTop: '4px',
  },
});

const Title = styled(Label)({});

const LoadingIndicator = styled(ProgressIndicator)({
  position: 'absolute',
  width: 'calc(100% - 16px)',
  left: 8,
  top: 25,
  zIndex: 2,
});

const searchBoxStyles = classNamesFunction<ISearchBoxProps, ISearchBoxStyles>()({
  root: {
    borderBottom: '1px solid ${colors.gray30}',
    width: '100%',
  },
  clearButton: { display: 'none' },
});

type ListHeaFormDialogSchemaListHeaderProps = {
  loading?: boolean;
  searchDisabled?: boolean;
  onChangeQuery: (e?: React.ChangeEvent<HTMLInputElement> | undefined, query?: string | undefined) => void;
  onCreateItem: () => void;
};

export const FormDialogSchemaListHeader = (props: ListHeaFormDialogSchemaListHeaderProps) => {
  const { loading = false, searchDisabled = false, onCreateItem, onChangeQuery } = props;

  const { 0: isFilterOn, 1: setFilterOn } = React.useState(false);
  return (
    <Stack horizontal styles={{ root: { padding: '0 12px' } }} tokens={{ childrenGap: 8 }} verticalAlign="center">
      <TitleBar horizontal verticalAlign="center">
        {isFilterOn ? (
          <SearchBox
            underlined
            ariaLabel={formatMessage('Type form dialog schema name')}
            iconProps={{ iconName: 'Filter' }}
            placeholder={formatMessage('Type form dialog schema name')}
            styles={searchBoxStyles}
            onChange={onChangeQuery}
            onEscape={() => setFilterOn(false)}
          />
        ) : (
          <Title>
            {formatMessage('Schemas')}
            <TooltipHost
              content={
                <span>
                  <span>{formatMessage('A schema, or form, is the list of properties your bot will collect.')}</span>
                  <Link
                    href="https://aka.ms/AAailpe#creating-and-connecting-a-form-dialog"
                    styles={{ root: { marginLeft: 4 } }}
                    target="_blank"
                  >
                    {formatMessage('Learn more about your property schema')}
                  </Link>
                </span>
              }
            >
              <Icon iconName="Unknown" styles={helpIconStyles} />
            </TooltipHost>
            {loading && <LoadingIndicator />}
          </Title>
        )}
      </TitleBar>
      {isFilterOn ? (
        <IconButton iconProps={{ iconName: 'ChromeClose' }} onClick={() => setFilterOn(false)} />
      ) : (
        <>
          <IconButton disabled={searchDisabled} iconProps={{ iconName: 'Search' }} onClick={() => setFilterOn(true)} />
          <IconButton iconProps={{ iconName: 'Add' }} onClick={onCreateItem} />
        </>
      )}
    </Stack>
  );
};
