import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { OnChoiceDelegate } from '../../types/types';
import { ChooseRegistryAction } from '../ChooseRegistryAction';

type Props = {
  creationType: string;
  onChoiceChanged: OnChoiceDelegate;
};

export const PageRegistryType = ({ creationType: controlledCreationType, onChoiceChanged }: Props) => {
  const [creationType, setCreationType] = useState<string>(controlledCreationType);

  useEffect(() => setCreationType(controlledCreationType || 'local'), [controlledCreationType]);
  useEffect(() => onChoiceChanged(creationType), [creationType]);

  return (
    <div style={{ height: 'calc(100vh - 65px)' }}>
      <ChooseRegistryAction choice={creationType} onChoiceChanged={onChoiceChanged} />
    </div>
  );
};
