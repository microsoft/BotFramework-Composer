/** @jsx jsx **/
import { jsx } from '@emotion/core';
import { useState, useContext, useMemo } from 'react';
import { Stack, StackItem } from 'office-ui-fabric-react';

import { Store } from '../../store/index';

import { container } from './styles';
import { SingleError } from './singleError';
export const ErrorStack = () => {
  const { state } = useContext(Store);
  const { errorMessages } = state;
  const [errorShownNum, setShowState] = useState(0);
  useMemo(() => {
    console.log(`get last  ${errorMessages.length}`);
    if (errorShownNum < 3) {
      setShowState(errorShownNum + 1);
    }
  }, [errorMessages]);
  const onDismiss = () => {
    setShowState(errorShownNum - 1);
  };
  return errorShownNum > 0 ? (
    <Stack tokens={{ childrenGap: 20 }} style={container}>
      {errorMessages.map((item, index) => {
        if (index < errorShownNum) {
          return (
            <StackItem>
              <SingleError onDismiss={onDismiss} message={item} />
            </StackItem>
          );
        } else {
          return;
        }
      })}
    </Stack>
  ) : null;
};
