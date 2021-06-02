// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC, useContext } from 'react';

import useWizard from './hooks/useWizard';

type Props = {
  title: string;
  showUserInfo?: boolean;
  children: React.ReactNode;
};

export const WizardStep: FC<Props> = (props: Props) => {
  const { title } = props;
  const { activeStepIndex, steps } = useWizard();
  return (
    <>
      {title && <h3>{title}</h3>}
      {/* TODO:Styled component  */}
      <hr />
      {props.children}
    </>
  );
  //Header
  //Content
  //Footer - actions
};
//what will be the best way to implement step actions?
//providing a component array feels like over engineering at this point
//Disable next step(button) when thye current step is invalid, this is only applicable when the current step is form
