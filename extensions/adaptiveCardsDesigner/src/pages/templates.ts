export const cardTemplates = [
  {
    displayName: 'Flight itinerary',
    body: {
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.0',
      type: 'AdaptiveCard',
      speak:
        'Your flight is confirmed for you and 3 other passengers from San Francisco to Amsterdam on Friday, October 10 8:30 AM',
      body: [
        {
          type: 'TextBlock',
          text: 'Passengers',
          weight: 'Bolder',
          isSubtle: false,
          wrap: true,
        },
        {
          type: 'TextBlock',
          text: 'Sarah Hum',
          separator: true,
          wrap: true,
        },
        {
          type: 'TextBlock',
          text: 'Jeremy Goldberg',
          spacing: 'None',
          wrap: true,
        },
        {
          type: 'TextBlock',
          text: 'Evan Litvak',
          spacing: 'None',
          wrap: true,
        },
        {
          type: 'TextBlock',
          text: '2 Stops',
          weight: 'Bolder',
          spacing: 'Medium',
          wrap: true,
        },
        {
          type: 'TextBlock',
          text: 'Tue, May 30, 2017 12:25 PM',
          weight: 'Bolder',
          spacing: 'None',
          wrap: true,
        },
        {
          type: 'ColumnSet',
          separator: true,
          columns: [
            {
              type: 'Column',
              width: 1,
              items: [
                {
                  type: 'TextBlock',
                  text: 'San Francisco',
                  isSubtle: true,
                  wrap: true,
                },
              ],
            },
            {
              type: 'Column',
              width: 1,
              items: [
                {
                  type: 'TextBlock',
                  horizontalAlignment: 'Right',
                  text: 'Amsterdam',
                  isSubtle: true,
                  wrap: true,
                },
              ],
            },
          ],
        },
        {
          type: 'ColumnSet',
          spacing: 'None',
          columns: [
            {
              type: 'Column',
              width: 1,
              items: [
                {
                  type: 'TextBlock',
                  size: 'ExtraLarge',
                  color: 'Accent',
                  text: 'SFO',
                  spacing: 'None',
                  wrap: true,
                },
              ],
            },
            {
              type: 'Column',
              width: 'auto',
              items: [
                {
                  type: 'Image',
                  url: 'https://adaptivecards.io/content/airplane.png',
                  size: 'Small',
                  spacing: 'None',
                  altText: 'Flight to',
                },
              ],
            },
            {
              type: 'Column',
              width: 1,
              items: [
                {
                  type: 'TextBlock',
                  horizontalAlignment: 'Right',
                  size: 'ExtraLarge',
                  color: 'Accent',
                  text: 'AMS',
                  spacing: 'None',
                  wrap: true,
                },
              ],
            },
          ],
        },
        {
          type: 'TextBlock',
          text: 'Non-Stop',
          weight: 'Bolder',
          spacing: 'Medium',
          wrap: true,
        },
        {
          type: 'TextBlock',
          text: 'Fri, Jun 2, 2017 1:55 PM',
          weight: 'Bolder',
          spacing: 'None',
          wrap: true,
        },
        {
          type: 'ColumnSet',
          separator: true,
          columns: [
            {
              type: 'Column',
              width: 1,
              items: [
                {
                  type: 'TextBlock',
                  text: 'Amsterdam',
                  isSubtle: true,
                  wrap: true,
                },
              ],
            },
            {
              type: 'Column',
              width: 1,
              items: [
                {
                  type: 'TextBlock',
                  horizontalAlignment: 'Right',
                  text: 'San Francisco',
                  isSubtle: true,
                  wrap: true,
                },
              ],
            },
          ],
        },
        {
          type: 'ColumnSet',
          spacing: 'None',
          columns: [
            {
              type: 'Column',
              width: 1,
              items: [
                {
                  type: 'TextBlock',
                  size: 'ExtraLarge',
                  color: 'Accent',
                  text: 'AMS',
                  spacing: 'None',
                  wrap: true,
                },
              ],
            },
            {
              type: 'Column',
              width: 'auto',
              items: [
                {
                  type: 'Image',
                  url: 'https://adaptivecards.io/content/airplane.png',
                  size: 'Small',
                  spacing: 'None',
                  altText: 'Flight to',
                },
              ],
            },
            {
              type: 'Column',
              width: 1,
              items: [
                {
                  type: 'TextBlock',
                  horizontalAlignment: 'Right',
                  size: 'ExtraLarge',
                  color: 'Accent',
                  text: 'SFO',
                  spacing: 'None',
                  wrap: true,
                },
              ],
            },
          ],
        },
        {
          type: 'ColumnSet',
          spacing: 'Medium',
          columns: [
            {
              type: 'Column',
              width: '1',
              items: [
                {
                  type: 'TextBlock',
                  text: 'Total',
                  size: 'Medium',
                  isSubtle: true,
                  wrap: true,
                },
              ],
            },
            {
              type: 'Column',
              width: 1,
              items: [
                {
                  type: 'TextBlock',
                  horizontalAlignment: 'Right',
                  text: '$4,032.54',
                  size: 'Medium',
                  weight: 'Bolder',
                  wrap: true,
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    displayName: 'Inputs',
    body: {
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      type: 'AdaptiveCard',
      version: '1.0',
      body: [
        {
          type: 'TextBlock',
          size: 'medium',
          weight: 'bolder',
          text: 'Input.Text elements',
          horizontalAlignment: 'center',
          wrap: true,
        },
        {
          type: 'TextBlock',
          text: 'Name',
          wrap: true,
        },
        {
          type: 'Input.Text',
          style: 'text',
          id: 'SimpleVal',
        },
        {
          type: 'TextBlock',
          text: 'Homepage',
          wrap: true,
        },
        {
          type: 'Input.Text',
          style: 'url',
          id: 'UrlVal',
        },
        {
          type: 'TextBlock',
          text: 'Email',
          wrap: true,
        },
        {
          type: 'Input.Text',
          style: 'email',
          id: 'EmailVal',
        },
        {
          type: 'TextBlock',
          text: 'Phone',
          wrap: true,
        },
        {
          type: 'Input.Text',
          style: 'tel',
          id: 'TelVal',
        },
        {
          type: 'TextBlock',
          text: 'Comments',
          wrap: true,
        },
        {
          type: 'Input.Text',
          style: 'text',
          isMultiline: true,
          id: 'MultiLineVal',
        },
        {
          type: 'TextBlock',
          text: 'Quantity',
          wrap: true,
        },
        {
          type: 'Input.Number',
          min: -5,
          max: 5,
          value: 1,
          id: 'NumVal',
        },
        {
          type: 'TextBlock',
          text: 'Due Date',
          wrap: true,
        },
        {
          type: 'Input.Date',
          id: 'DateVal',
          value: '2017-09-20',
        },
        {
          type: 'TextBlock',
          text: 'Start time',
          wrap: true,
        },
        {
          type: 'Input.Time',
          id: 'TimeVal',
          value: '16:59',
        },
        {
          type: 'TextBlock',
          size: 'medium',
          weight: 'bolder',
          text: 'Input.ChoiceSet',
          horizontalAlignment: 'center',
          wrap: true,
        },
        {
          type: 'TextBlock',
          text: 'What color do you want? (compact)',
          wrap: true,
        },
        {
          type: 'Input.ChoiceSet',
          id: 'CompactSelectVal',
          style: 'compact',
          value: '1',
          choices: [
            {
              title: 'Red',
              value: '1',
            },
            {
              title: 'Green',
              value: '2',
            },
            {
              title: 'Blue',
              value: '3',
            },
          ],
        },
        {
          type: 'TextBlock',
          text: 'What color do you want? (expanded)',
          wrap: true,
        },
        {
          type: 'Input.ChoiceSet',
          id: 'SingleSelectVal',
          style: 'expanded',
          value: '1',
          choices: [
            {
              title: 'Red',
              value: '1',
            },
            {
              title: 'Green',
              value: '2',
            },
            {
              title: 'Blue',
              value: '3',
            },
          ],
        },
        {
          type: 'TextBlock',
          text: 'What colors do you want? (multiselect)',
          wrap: true,
        },
        {
          type: 'Input.ChoiceSet',
          id: 'MultiSelectVal',
          isMultiSelect: true,
          value: '1,3',
          choices: [
            {
              title: 'Red',
              value: '1',
            },
            {
              title: 'Green',
              value: '2',
            },
            {
              title: 'Blue',
              value: '3',
            },
          ],
        },
        {
          type: 'TextBlock',
          size: 'medium',
          weight: 'bolder',
          text: 'Input.Toggle',
          horizontalAlignment: 'center',
          wrap: true,
        },
        {
          type: 'Input.Toggle',
          title: 'I accept the terms and conditions (True/False)',
          valueOn: 'true',
          valueOff: 'false',
          id: 'AcceptsTerms',
        },
        {
          type: 'Input.Toggle',
          title: 'Red cars are better than other cars',
          valueOn: 'RedCars',
          valueOff: 'NotRedCars',
          id: 'ColorPreference',
        },
      ],
      actions: [
        {
          type: 'Action.Submit',
          title: 'Submit',
          data: {
            id: '1234567890',
          },
        },
        {
          type: 'Action.ShowCard',
          title: 'Show Card',
          card: {
            type: 'AdaptiveCard',
            body: [
              {
                type: 'TextBlock',
                text: 'Enter comment',
                wrap: true,
              },
              {
                type: 'Input.Text',
                style: 'text',
                id: 'CommentVal',
              },
            ],
            actions: [
              {
                type: 'Action.Submit',
                title: 'OK',
              },
            ],
          },
        },
      ],
    },
  },
];
