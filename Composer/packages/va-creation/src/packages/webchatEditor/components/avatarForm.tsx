import React from 'react';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';

interface IAvatarForm {
  updateStyleElement: (styleElementName: string, value: any) => void;
}

export const AvatarForm: React.StatelessComponent<IAvatarForm> = (props: IAvatarForm) => {
  const botIconOptions: IChoiceGroupOption[] = [
    { key: 'day', text: 'Retro Bot', imageSrc: 'http://www.wired.com/wp-content/uploads/2016/04/chat_bot-01.jpg' },
    {
      key: 'week',
      text: 'Happy Bot',
      imageSrc:
        'https://social.technet.microsoft.com/wiki/cfs-file.ashx/__key/communityserver-wikis-components-files/00-00-00-00-05/2134.bot_2D00_icon_2D00_2883144_5F00_1280.png',
    },
    {
      key: 'month',
      text: 'Silly Bot',
      imageSrc: 'https://hoopp.com/images/default-source/icons/employment-changes.png',
    },
  ];

  const userIconOptions: IChoiceGroupOption[] = [
    {
      key: 'day',
      text: 'Standard',
      imageSrc: 'https://cdn.pixabay.com/photo/2016/11/14/17/39/person-1824144_960_720.png',
    },
    {
      key: 'week',
      text: 'Chatty',
      imageSrc: 'https://www.burnhambenefitadvisors.com/wp-content/uploads/2016/07/consultation.png',
    },
    {
      key: 'month',
      text: 'Custom',
      imageSrc: 'https://our.status.im/content/images/2018/07/status_logo_blue_1--2-.png',
    },
  ];
  return (
    <div>
      <ChoiceGroup
        label="Bot Icon"
        defaultSelectedKey="day"
        options={botIconOptions}
        onChange={(ev: any, option?: IChoiceGroupOption) => {
          props.updateStyleElement('botAvatarImage', option?.imageSrc);
        }}
      />
      <ChoiceGroup
        label="User Icon"
        defaultSelectedKey="day"
        options={userIconOptions}
        onChange={(ev: any, option?: IChoiceGroupOption) => {
          props.updateStyleElement('userAvatarImage', option?.imageSrc);
        }}
      />
    </div>
  );
};
