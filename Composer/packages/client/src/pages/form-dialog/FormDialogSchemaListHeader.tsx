// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import * as React from 'react';
import { SearchBox, ISearchBoxProps, ISearchBoxStyles } from 'office-ui-fabric-react/lib/SearchBox';
import { classNamesFunction } from 'office-ui-fabric-react/lib/Utilities';

const TitleBar = styled(Stack)({
  flex: 1,
  height: 45,
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
    borderBottom: '1px solid #edebe9',
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
