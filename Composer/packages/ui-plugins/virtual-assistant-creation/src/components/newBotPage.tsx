// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useContext } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { BotTypeTile } from './botTypeTile';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { mergeStyles } from '@uifabric/merge-styles';
import { IAssistant } from '../models/stateModels';
import { Image, IImageStyles } from 'office-ui-fabric-react/lib/Image';
import { AppContext } from './VirtualAssistantCreationModal';
import formatMessage from 'format-message';
import { DialogFooterWrapper } from './dialogFooterWrapper';
import { RouterPaths } from '../shared/constants';

// import { CustomAssistantImg, EnterpriseAssistantImg, HospitalityAssistantImg } from '../shared/assets';
// const customImg = require('../shared/assets/customAssistant.jpg');
// const hospitalityImg = require('../shared/assets/hospitality.jpg');
// const enterpriseImg = require('../shared/assets/EnterpriseAssistant.jpg');
// const CloudFileImg = require('./cloud_file_img.svg') as string;
// const CustomAssistantImg = require('./custom_assistant.svg') as string;
// const EnterpriseAssistantImg = require('./enterprise_assistant.svg') as string;
// const HospitalityAssistantImg = require('./hospitality_assistant.svg') as string;

interface NewBotPageProps
  extends RouteComponentProps<{
    location: string;
  }> {
  onDismiss: () => void;
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

  let renderImage = () => {
    const imageClassName = mergeStyles({
      display: 'inline-block',
      position: 'relative',
    });

    var assistantImage =
      'https://social.technet.microsoft.com/wiki/cfs-file.ashx/__key/communityserver-wikis-components-files/00-00-00-00-05/2134.bot_2D00_icon_2D00_2883144_5F00_1280.png';
    // switch (state.selectedAssistant.name){
    //     case 'Enterprise Assistant':
    //         assistantImage = EnterpriseAssistantImg;
    //         break;
    //     case 'Hospitality Assistant':
    //         assistantImage = HospitalityAssistantImg;
    //         break;
    //     case 'Custom Assistant':
    //         assistantImage = CustomAssistantImg;
    //         break;
    // }
    const imageStyles: Partial<IImageStyles> = {
      image: { height: '200px', width: '200px' },
    };
    return (
      <Image
        styles={imageStyles}
        className={imageClassName}
        src={assistantImage}
        alt="Example with no image fit value and no height or width is specified."
      />
    );
  };

  let onDismiss = () => {
    const imageClassName = mergeStyles({
      display: 'inline-block',
      position: 'relative',
    });
  };

  let handleSubmit = () => {
    const imageClassName = mergeStyles({
      display: 'inline-block',
      position: 'relative',
    });
  };

  return (
    <Fragment>
      <DialogWrapper
        isOpen={true}
        // onDismiss={null}
        title={'Choose Your Assistant'}
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
            <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg4">{renderImage()}</div>
          </div>
        </div>
        <DialogFooterWrapper
          prevPath={RouterPaths.defineConversationPage}
          nextPath={RouterPaths.customizeBotPage}
          onDismiss={props.onDismiss}
        />
      </DialogWrapper>
    </Fragment>
  );
};

export default NewBotPage;
