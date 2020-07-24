This document describes my assessment of moving to [Recoil](http://recoiljs.org) for application state management based on converting an application to Recoil.  It provides the pros and cons I discovered, what I think influences the cost of adoption/conversion, my best practices, and an example of implementing the Dispatcher pattern.

# Background : Assessment Process
I have a React application (a text labeler) initially written using MobX. The application state followed the typical approach for MobX - a hierarchy of models which use @observable and @computed. Update to model state was done with @action methods in the models (although following a dispatch/handler pattern would have been an easy alternative). The React components for the app were a mixture of container components, presentation components, and pure components. The container components were wrapped with the MobX observer() method to respond to state changes.  The presentation components relied on prop changes and React.useEffect.  The pure components relied only on prop changes.

I rewrote the application without MobX and using only using React's context API and useEffect to respond to state changes. The application state remained in a hierarchy, but without any observer/observable pattern.  The state was passed down the component hierarchy via context.  Container components detected state changes via additional useEffect calls. In order to coordinate larger reset of the application state (such as clearing most data), an application pub/sub mechanism was used to communicate between components to orchestrate the sequence of clearing state. This was because the useEffect order was difficult to guarantee.

Finally, I rewrote the application to use Recoil. I flattened the application state into atoms. Because relationships between the data create a logical hierarchy, I wrote utility functions to make cross referencing between data islands easy. I then wrote selectors to shape the data for my React components. The container components leveraged useRecoilValue and useRecoilState to respond to state changes. Because the same application state change be updated from different React components, I implemented a dispatcher pattern based on useRecoilCallback.  I had several missteps as I learned how Recoil works, and discovered how my application was affected by flattening the state.

# Recoil API: Pros, Cons, Unknowns, and Hazards

## Overall
- PRO: Built for hooks from the start and follows React concepts
- PRO: Atom and selectors allow for composing applications from small pieces without introducing unnecessary dependencies.
- PRO: Significantly reduces the complexity and code volume in components.
- PRO: Looking toward the future of asynchronous, multi-threaded Javascript.
- PRO: Recoil API surface is tiny
- PRO: Lightning fast (at least for my application size)
- CON: Still experimental, few releases, limited contributes - not yet mature or fully tested.

## Atoms
- PRO: Like their name, atoms let you model your data as small and independent plain types.
- PRO: Serializing atoms to storage is straightforward compared to trying to rehydrate an observed state tree.
- PRO: The default state of an atom with the reset() hook is convenient for clearing application state.
- CON: Atoms are often arrays of items which means needing to look up items. This requires more undefined checks for cases where items are not found.
- CON: There is additional "param baggage" to pass multiple atoms to different functions vs. passing the root of the application state or a child.
- HAZARD: Care has to be taken to avoid updating atom state by mutating the current state.  Only a set will trigger change detection.

## Selectors
- PRO: Simple to shape data for React components. 
- PRO: Like atoms they are small and can be built as an library of independent data shapes.
- PRO: The dependency chain from one selector to other selectors or atoms is easy to follow.
- PRO: Less ceremony compared to Redux's mapStateToProps.
- UNKNOWN: Unsure if a selector would re-compute its value if no UI is subscribed to it currently but it had been subscribed before.
- UNKNOWN: The writable selector is not well documented and unclear when to use.
- HAZARD: Atom (and selector) key names need to be unique across the application. It can be easy to create an atom and selector with the same key.

## useRecoilValue, useSetRecoilValue, useRecoilState hooks
- PRO: The recoil state hooks cause rendering just like useState.
- PRO: useRecoilValue and useSetRecoil value clearly denote the read-only and write-only scenarios.
- PRO: No magic inspecting dot-notation usage like with MobX.  
- HAZARD: Very easy to accidentally put a recoil hook within a condition. They need to be used as a block at the start of a component just like React hooks.

## useRecoilCallback hook
- PRO: Allows for creating methods that always get latest state even when called outside the context of a React component render. 
- CON: It can be a bit of extra effort to get the Typescript types worked out for complex callbacks.
- UNKNOWN: Unclear when to use the dependencies parameter vs. the getPromise to get latest state
- UNKNOWN: Unclear when to use the synchronous loader vs the asynchronous getPromise.- UNKNOWN:? The callback documentation indicates is still possible this hook will change. This is likely due to the experimental portions relating to JS async threading.
- HAZARD: Using getPromise within a callback requires the callback method be async, the return value be a promise, and usage outside UI callbacks use await.
- HAZARD: Using set within a callback that is called multiple times in succession or called from other callbacks requires using updator function to ensure latest state.  Otherwise arrays may not be updated with the previous call and will be overridden - losing data.

## RecoilRoot component
- PRO: Simple to understand. It leverages the React context API, but more efficiently tracking atoms and selectors as keys in a dictionary.
- HAZARD: The React component rendering RecoilRoot cannot use recoil hooks.
? I didn't try nesting any RecoilRoots so I don't know if that really works.

# Cost/Impact of moving to Recoil
- Restructuring application state from observable hierarchy to flat arrays is painful and expensive. A major refactoring is likely to introduce bugs if there is insufficient testing on the existing code.
- Converting deep dependencies on the context API down the component hierarchy is expensive especially when there are few pure functional components.
- Creating selectors is straightforward. Many existing render calculations can be replaced incrementally with selectors.
- Updating components to leverage recoil hooks rather than props with React.useEffect or React.useState is straightforward. Data passed through context can be updated with an atom or selector and then context usage can be replace incrementally down the component hierarchy.
- Updating an existing dispatcher pattern is straightforward.

# Tips and Best Practices

## Follow functional programming paradigms
- Always make state data immutable: All types used with atoms should have read only fields. 
- Always write pure update functions: Write function that take read only inputs and return a new modified instance. This avoid repeating the update logic in multiple components (i.e. DRY).
- If you atoms are related to or party of a hierarchy of other atoms, author lookup functions to help navigate the hierarchy. This will avoid repeating similar logic in multiple selectors. 

## Create atoms like you would independent files or tables in a database
- Avoid deeply nested types. Prefer to think of each atom containing an array as a set of rows in a table.
- Prefer to put identity on your items for easy lookup. The uuid NPM package does a great job. Note: You can create a selector to produce a dictionary if you have large numbers of reads compared to writes on an array atom.

## Create selectors based on each React component's needs
- Prefer to create selectors to make it easy to render your component. Think of selectors as tiny view-models for different pieces of your UI.
- Prefer to write each selector as purpose built for one rendering/component. Selectors should follow the Single Responsibility Principle.
- Avoid creating selectors that generate more data than a component uses.  For example, a giant state tree where a component only renders a few parts. Otherwise, the selector is doing extra work and your component will re-render in response to data it doesn't use.

## Prefer to separate common state updates into a dispatcher pattern.
- The useRecoilState hook can encourage UI components to implement duplicate application logic to update state. This is bad.
- The dispatcher pattern separates rendering and state update concerns. 
- The pattern is easy to implement:
  - The dispatcher is a set of functions implemented wrapped with useRecoilCallback.
  - The pointer to the dispatcher can be put in an atom for any component to use via useRecoilValue.
  - The dispatcher can be instantiated and set in the atom one time when the top level component mounts.
- Note: React components should still be in charge of updating internal state created with the React.useState hook.

## Don't stop benefiting from React: Pure functional components, useState, useMemo, useEffect, or Context
- Prefer creating components that leverage props composed of simple types. 
- Keep using local component state when possible. 
- It is still good to create components that work both uncontrolled and controlled via useState and useEffect.
- Only introduce the dependency on recoil where required. This will generally be at higher level container components level.
- It is perfectly OK to leverage pub/sub event busses where dependency on shared state is awkward across component hierarchy siblings.
- It is OK to use the Context API to avoid prop drilling when data is confined to one branch of the component hierarchy and does not require frequent updates or change detection.

## Consider instrumenting and measuring render performance before and after recoil
- MobX, Redux, and Recoil have different approaches to change detection and triggering rendering. 
- Consider measuring the number and duration of render calls, compute function updates, and state updates.

# How to implement a dispatcher pattern


## Create a dispatcher composed of useRecoilCallback functions

```typescript
export const createDispatcher = () => {
    // Example: Setting new state
    // Supports frequent multiple calls sometimes from other callbacks.
    const logMessage = useRecoilCallback<[string], void>((callbackHelpers: CallbackInterface, message: string) => {
        const { set } = callbackHelpers;

        // Example of using the set updator function to ensure latest state.
        
        set(logEntryListState, (logEntries) => [...logEntries, message]);
    });

    // Example: Reset state, load from file, and set state.
    const loadDocument = useRecoilCallback<[string], void>(async (callbackHelpers: CallbackInterface, file: string) => {
        const { set, reset } = callbackHelpers;

        reset(stepState);
        reset(labelListState);
        reset(labelingAreaListState);
        reset(predictionListState);

        const newText = fsExtra.readFileSync(file);
        set(labeledDocumentState, { location: file, name: path.basename(file), text: newText.toString() });

        logMessage(`loaded document: ${file}`);
    });

    // Example: Using getPromise to read data, set new state, and then return a value
    // Note that callers that are not part of a UI callback (i.e. onClick) need to await the Promise<Label> return value
    const addLabel = useRecoilCallback<[Label, CharacterRange, Entity], Promise<Label>>(
        async (callbackHelpers: CallbackInterface, parent: Label, charRange: CharacterRange, entity: Entity) => {
            const { getPromise, set } = callbackHelpers;

            const labels = await getPromise(labelListState);
            const newLabel: Label = {
                id: uuidv4(),
                charRange: charRange,
                entityId: entity.id,
                parent: { kind: 'label', id: parent.id },
            };
            set(labelListState, [...labels, newLabel]);
            logMessage(`+label ${entity.name}  ${characterRangeToString(newLabel.charRange)}`);
            return newLabel;
        }
    );
...
}
```

## Allow any component to use the dispatcher

```typescript
// Create an atom to hold the dispatcher instance
export const dispatcherState = atom<Dispatcher | undefined>({
  key: 'dispatcherState',
  default: undefined 
});
```

```tsx
export const Main = () => {
    
    // Use a ref to ensure the dispatcher is only created once
    const dispatcherRef = React.useRef(createDispatcher());

    // When the main component is mounted set the dispatcher state
    const setDispatcher = useSetRecoilState(dispatcherState);
    React.useEffect(() => {
        setDispatcher(dispatcherRef.current);
    }, []);
```