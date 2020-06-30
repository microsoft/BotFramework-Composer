// // Copyright (c) Microsoft Corporation.
// // Licensed under the MIT License.

// import * as React from 'react';
// import { render, fireEvent } from '@bfc/test-utils';
// import { createHistory, createMemorySource, LocationProvider } from '@reach/router';
// import { RecoilRoot, MutableSnapshot } from 'recoil';

// import { StoreContext } from '../../../src/store';
// import CreationFlow from '../../../src/components/CreationFlow/index';
// import { DispatcherWrapper, focusedStorageFolderState, templateIdState } from '../../../src/recoilModel';

// jest.mock('../../../src/components/DialogWrapper', () => {
//   return {
//     DialogWrapper: jest.fn((props) => {
//       return props.children;
//     }),
//   };
// });

// describe('<CreationFlow/>', () => {
//   let locationMock;

//   function renderComponent() {
//     return render(
//       <StoreContext.Provider>
//         <CreationFlow location={locationMock} />
//       </StoreContext.Provider>
//     );
//   }

//   function renderWithRouter(ui, { route = '', history = createHistory(createMemorySource(route)) } = {}) {
//     return {
//       ...render(<LocationProvider history={history}>{ui}</LocationProvider>),
//       history,
//     };
//   }

//   it('should render the component', async () => {
//     const expectedTemplateId = 'EchoBot';

//     // storeContext.actions.createProject = async (templateId, name, description, location) => {
//     //   expect(templateId).toBe(expectedTemplateId);
//     //   expect(location === '\\test-folder\\Desktop' || location === '/test-folder/Desktop').toBeTruthy();
//     // };

//     const {
//       history: { navigate },
//     } = renderWithRouter(
//       <RecoilRoot
//         initializeState={({ set }: MutableSnapshot) => {
//           set(templateIdState, 'EchoBot');
//           set(focusedStorageFolderState, {
//             name: 'Desktop',
//             parent: '/test-folder',
//             writable: true,
//             children: [
//               {
//                 name: 'EchoBot-0',
//                 type: 'bot',
//                 path: 'Desktop/EchoBot-11299',
//                 lastModified: 'Wed Apr 22 2020 17:51:07 GMT-0700 (Pacific Daylight Time)',
//                 size: 1,
//               },
//             ],
//           });
//         }}
//       >
//         <DispatcherWrapper>
//           <CreationFlow location={locationMock} />
//         </DispatcherWrapper>
//       </RecoilRoot>
//     );

//     // const component = renderComponent();
//     await navigate('create/Emptybot');
//     // const node = await component.findByText('OK');
//     // fireEvent.click(node);
//   });
// });
