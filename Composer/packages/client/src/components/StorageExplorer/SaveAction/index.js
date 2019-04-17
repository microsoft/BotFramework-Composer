/** @jsx jsx */
import { jsx } from '@emotion/core';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

import { saveButtonClass, saveContainer, saveInputClass } from './styles';

export function SaveAction() {
  return (
    <div css={saveContainer}>
      <TextField suffix=".botproj" css={saveInputClass} />
      <DefaultButton primary text="Save" styles={saveButtonClass} iconProps={{ iconName: 'SaveAs' }} />
    </div>
  );
}
