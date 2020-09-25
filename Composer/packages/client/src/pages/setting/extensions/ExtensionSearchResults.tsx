// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
import {
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  CheckboxVisibility,
} from 'office-ui-fabric-react/lib/DetailsList';
import { ScrollablePane } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky } from 'office-ui-fabric-react/lib/Sticky';
import { ShimmeredDetailsList } from 'office-ui-fabric-react/lib/ShimmeredDetailsList';

// TODO: extract to shared?
export type ExtensionSearchResult = {
  id: string;
  keywords: string[];
  version: string;
  description: string;
  url: string;
};

type ExtensionSearchResultsProps = {
  results: ExtensionSearchResult[];
  isSearching: boolean;
  onSelect: (extension: ExtensionSearchResult) => void;
};

const containerStyles = css`
  position: relative;
  height: 400px;
`;

const noResultsStyles = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ExtensionSearchResults: React.FC<ExtensionSearchResultsProps> = (props) => {
  const { results, isSearching, onSelect } = props;

  const searchColumns: IColumn[] = [
    {
      key: 'name',
      name: formatMessage('Name'),
      minWidth: 100,
      maxWidth: 150,
      onRender: (item: ExtensionSearchResult) => {
        return <span>{item.id}</span>;
      },
    },
    {
      key: 'description',
      name: formatMessage('Description'),
      minWidth: 100,
      maxWidth: 300,
      isMultiline: true,
      onRender: (item: ExtensionSearchResult) => {
        return <div css={{ overflowWrap: 'break-word' }}>{item.description}</div>;
      },
    },
    {
      key: 'version',
      name: formatMessage('Version'),
      minWidth: 30,
      maxWidth: 100,
      onRender: (item: ExtensionSearchResult) => {
        return <span>{item.version}</span>;
      },
    },
    {
      key: 'url',
      name: formatMessage('Url'),
      minWidth: 100,
      maxWidth: 100,
      onRender: (item: ExtensionSearchResult) => {
        return item.url ? (
          <a href={item.url} rel="noopener noreferrer" target="_blank">
            View on npm
          </a>
        ) : null;
      },
    },
  ];

  const noResultsFound = !isSearching && results.length === 0;

  return (
    <div css={containerStyles}>
      <ScrollablePane>
        <ShimmeredDetailsList
          checkboxVisibility={CheckboxVisibility.always}
          columns={searchColumns}
          enableShimmer={isSearching}
          items={noResultsFound ? [{}] : results}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.single}
          shimmerLines={8}
          onActiveItemChanged={(item) => onSelect(item)}
          onRenderDetailsHeader={(headerProps, defaultRender) => {
            if (defaultRender) {
              return <Sticky>{defaultRender(headerProps)}</Sticky>;
            }

            return <div />;
          }}
          onRenderRow={(rowProps, defaultRender) => {
            // there are no search results
            if (!isSearching && results.length === 0) {
              return (
                <div css={noResultsStyles}>
                  <p>No search results</p>
                </div>
              );
            }

            if (defaultRender) {
              return defaultRender(rowProps);
            }

            return null;
          }}
        />
      </ScrollablePane>
    </div>
  );
};

export { ExtensionSearchResults };
