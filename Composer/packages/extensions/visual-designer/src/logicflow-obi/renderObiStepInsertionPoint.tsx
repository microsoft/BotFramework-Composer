import React from 'react';
import { EdgeMenu } from 'shared-menus';

export const renderObiStepInsertionPoint = (arrayId: string, index: number) => {
  return <EdgeMenu onClick={$type => console.log('Insert event fired:', $type, arrayId, index)} />;
};
