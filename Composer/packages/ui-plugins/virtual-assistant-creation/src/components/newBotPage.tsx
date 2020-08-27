// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useContext } from 'react';
import { RouteComponentProps } from '@reach/router';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { BotTypeTile } from './botTypeTile';
import { Label } from 'office-ui-fabric-react/lib/Label';
// import { mergeStyles } from '@uifabric/merge-styles';
import { IAssistant } from '../models/stateModels';
// import { Image } from 'office-ui-fabric-react/lib/Image';
import { AppContext } from './VirtualAssistantCreationModal';
// const customImg = require('../shared/assets/customAssistant.jpg');
// const hospitalityImg = require('../shared/assets/hospitality.jpg');
// const enterpriseImg = require('../shared/assets/EnterpriseAssistant.jpg');

interface NewBotPageProps
  extends RouteComponentProps<{
    location: string;
  }> {
  // Add Props Here
}

export const NewBotPage: React.FC<NewBotPageProps> = (props) => {
  const { state, setState } = useContext(AppContext);

  let assistantSelectionChanged = (event: any, option?: IChoiceGroupOption) => {
    var selectedAssistant = state.availableAssistantTemplates.find((assistant: IAssistant) => {
      return assistant.name.toLowerCase() == option?.key.toLowerCase();
    });
    if (selectedAssistant) {
      setState({ ...state, selectedAssistant: selectedAssistant });
    } else {
      // TODO log error
    }
  };

  let getAssistantsToRender = (): IChoiceGroupOption[] => {
    var result: IChoiceGroupOption[] = [];
    state.availableAssistantTemplates.forEach((assistant: IAssistant) => {
      result.push({
        key: assistant.name,
        text: '',
        onRenderField: (props, render) => {
          return (
            <Fragment>
              {render!(props)}
              <BotTypeTile botName={assistant.name} botDescription={assistant.description} />
            </Fragment>
          );
        },
      });
    });
    return result;
  };

  // let renderImage = () => {
  //     const imageClassName = mergeStyles({
  //         display:'inline-block',
  //         position:'relative',
  //     })

  //     var assistantImage = customImg;
  //     switch (state.selectedAssistant.name){
  //         case 'Enterprise Assistant':
  //             assistantImage = enterpriseImg;
  //             break;
  //         case 'Hospitality Assistant':
  //             assistantImage = hospitalityImg;
  //             break;
  //         case 'Custom Assistant':
  //             assistantImage = customImg;
  //             break;
  //     }

  //     return (
  //         <Image
  //         className={imageClassName}
  //         src={assistantImage}
  //         alt="Example with no image fit value and no height or width is specified."
  //     />
  //     );
  // }

  return (
    <Fragment>
      <DialogWrapper
        isOpen={true}
        // onDismiss={null}
        title={'Create New'}
        subText={'Create a new bot or choose from Virtual assistant templates. Learn More'}
        dialogType={DialogTypes.CreateFlow}
      >
        <div className="ms-Grid" dir="ltr">
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg8">
              <Label>Choose one:</Label>
              <ChoiceGroup
                required={true}
                onChange={(event: any, option?: IChoiceGroupOption) => {
                  assistantSelectionChanged(event, option);
                }}
                styles={{
                  root: {
                    width: '100%',
                  },
                }}
                defaultSelectedKey={state.selectedAssistant.name}
                options={getAssistantsToRender()}
              />
            </div>
            <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg4">{/* {renderImage()} */}</div>
          </div>
        </div>
      </DialogWrapper>
    </Fragment>
  );
};

export default NewBotPage;
