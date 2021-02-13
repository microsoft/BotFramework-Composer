// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useState, useRef } from 'react';
import { render } from '@bfc/extension-client';
import { CardDesigner } from 'adaptivecards-designer';

import 'adaptivecards-designer/dist/adaptivecards-designer.css';

// import * as monaco from "monaco-editor";
// import * as markdownit from "markdown-it";
// import * as ACDesigner from "adaptivecards-designer";

type myDiv = HTMLDivElement;

// <script src="https://unpkg.com/adaptivecards@latest/dist/adaptivecards.min.js"></script>
// <!-- REQUIRED: adaptive-expressions is required by adaptivecards-templating library to enable data binding support in designer -->
// <script src="https://unpkg.com/adaptive-expressions@4/lib/browser.js"></script>
// <!-- REQUIRED: adaptivecards-templating library to enable data binding support in designer -->
// <script src="https://unpkg.com/adaptivecards-templating@latest/dist/adaptivecards-templating.min.js"></script>

// <!-- OPTIONAL: markdown-it isn't required but enables out-of-the-box markdown support -->
// <script src="https://unpkg.com/markdown-it@8.4.0/dist/markdown-it.min.js"></script>

// <!-- REQUIRED: monaco-editor is required for the designer to work -->
// <script src="https://unpkg.com/monaco-editor@0.17.1/min/vs/loader.js"></script>

// <!-- DESIGNER OPTION A: Card Designer + Standard Hosts
// 	(replace <VERSION> with the version you want to load, or "latest" for latest)
// -->
// <script src="https://unpkg.com/adaptivecards-designer@<VERSION>/dist/adaptivecards-designer.min.js"></script>

const scripts = [
  // 'https://unpkg.com/adaptivecards@latest/dist/adaptivecards.min.js',
  // 'https://unpkg.com/adaptive-expressions@4/lib/browser.js',
  // 'https://unpkg.com/adaptivecards-templating@latest/dist/adaptivecards-templating.min.js',
  // 'https://unpkg.com/markdown-it@8.4.0/dist/markdown-it.min.js',
  // 'https://unpkg.com/monaco-editor@0.17.1/min/vs/loader.js',
  // 'https://unpkg.com/adaptivecards-designer@latest/dist/adaptivecards-designer.min.js',
  // 'file:///Users/abrown/Desktop/test.js'
];

const Library: React.FC = (props) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const myDiv = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.monaco) {
        clearInterval(interval);
        setIsLoaded(true);
      }
    }, 500);
  }, []);

  useEffect(() => {
    if (isLoaded && myDiv.current) {
      // const adaptiveCard = new ACDesigner.CardDesigner([new ACDesigner.WebChatContainer("Bot Framework WebChat", "containers/webchat-container.css"),]);
      const hostContainers = [];

      // Optional: add the default Microsoft Host Apps (see docs below)
      // hostContainers = ACDesigner.defaultMicrosoftHosts;
      console.log('newing up');
      // @ts-ignore
      const designer = new CardDesigner(hostContainers);

      // The designer requires various CSS and image assets to work properly,
      // If you've loaded the script from a CDN it needs to know where these assets are located
      // Use the same <VERSION> that you used above
      designer.assetPath = 'https://unpkg.com/adaptivecards-designer@latest/dist';

      // Initialize monaco-editor for the JSON-editor pane. The simplest way to do this is use the code below
      // @ts-ignore

      // @ts-ignore
      designer.monacoModuleLoaded();
      designer.attachTo(myDiv.current);
    }
    // adaptiveCard.attachTo(myDiv);
    // adaptiveCard.monacoModuleLoaded(monaco);
  }, [isLoaded]);
  return <div ref={myDiv} />;
};

render(<Library />);

// import * as React from 'react';
// import * as AdaptiveCards from "microsoft-adaptivecards";

// export interface Props {
//     content: any
// }

// export class AdaptiveCardContainer extends React.Component<Props, {}> {
//     private div: HTMLDivElement;

//     constructor(props: Props) {
//         super(props);
//     }

//     componentDidMount() {
//         var adaptiveCard = new AdaptiveCards.AdaptiveCard();
//         adaptiveCard.parse(this.props.content);
//         const renderedCard = adaptiveCard.render();

//         this.div.appendChild(renderedCard);
//     }

//     render() {
//         return (
//             <div ref={div => this.div = div} />
//         )
//     }
// }
