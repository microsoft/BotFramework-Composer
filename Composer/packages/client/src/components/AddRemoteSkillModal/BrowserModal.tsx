import React, { useRef } from 'react';
import formatMessage from 'format-message';
import { DefaultButton } from 'office-ui-fabric-react';

export const BrowserModal = (props) => {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const onClickOpen = () => {
    inputFileRef?.current?.click();
  };

  const onChange = () => {
    const file = inputFileRef?.current?.files?.item(0);
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = function () {
        const fileString = this.result;
        console.log(typeof fileString);
        typeof fileString === 'string' && fileString && props.onUpdate(file.name, JSON.parse(fileString));
      };
    }
  };

  return (
    <>
      <DefaultButton
        styles={{ root: { marginLeft: '8px', float: 'right', marginTop: '29px' } }}
        text={formatMessage('Browser')}
        onClick={onClickOpen}
      />
      <input type="file" ref={inputFileRef} accept="application/json" style={{ display: 'none' }} onChange={onChange} />
    </>
  );
};
