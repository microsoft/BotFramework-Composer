/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { PropTypes } from 'prop-types';

import httpClient from '../../utils/http';

import { header, actionButton, fileInput } from './styles';

export const HeaderBar = props => (
  <header css={header}>
    <div css={actionButton}>
      <ActionButton css={actionButton} iconProps={{ iconName: 'CirclePlus', iconColor: '#ffffff' }}>
        <span> New </span>
      </ActionButton>
      <ActionButton css={actionButton} iconProps={{ iconName: 'OpenInNewWindow', iconColor: '#ffffff' }}>
        <input css={fileInput} type="file" accept=".bot, .botproj" onChange={e => props.onFileOpen(e.target.files)} />
        <span> Open</span>
      </ActionButton>
    </div>
  </header>
);

HeaderBar.propTypes = {
  client: PropTypes.instanceOf(httpClient),
  onFileOpen: PropTypes.func,
};
