import { css } from '@emotion/core';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';

export const saveContainer = css`
  display: flex;
  justify-content: space-between;
  padding-left: 10px;
  padding-right: 30px;
`;

export const saveButtonClass = mergeStyleSets({
  icon: {
    fontSize: '20px',
    height: '20px',
    lineHeight: '20px',
  },
  label: {
    fontSize: '13px',
  },
});

export const saveInputClass = css`
  flex-grow: 1;
  margin-right: 10px;
`;

export const loading = css`
  width: 98px;
`;
