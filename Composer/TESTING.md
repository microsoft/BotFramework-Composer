# Testing within the Composer Project

Tests inside of the Composer project are run via Jest ([documentation](https://jestjs.io/docs/en/24.0/getting-started.html)), with coverage reporting from Jest's built-in reporting tool istanbul.

Tests are scoped to each of the packages within the Composer project, and can be found in the `__tests__` directory inside of each package directory. For example, **client** tests can be found under the `<root>/Composer/packages/client/__tests__/` directory, **visual designer** tests can be found under the `<root>/Composer/packages/extensions/visual-designer/__tests__` directory, etc.

## Running Tests

Tests can be run in two ways:

- **Project-wide** - runs tests across all packages (client, extensions, server, etc.)

  ```
  cd <root>/Composer
  yarn test
  ```

  > **NOTE:** if you would like to see coverage results, use the command `yarn test:coverage` instead

- **Per-package** - runs only the tests within the current package

  ```
  cd <root>/Composer/packages/client
  yarn test
  ```

## Writing Tests

> **IMPORTANT:** Any new code being checked in should also come with new tests!

When writing tests for any React components, we will be using the `react-testing-library` ([documentation](https://testing-library.com/docs/react-testing-library/api)).

For some examples of how to write React component tests, look at the tests under the `<root>/Composer/packages/client/__tests__/` directory, or at the below examples.

There are also some [specific examples in the documentation.](https://react-testing-examples.com/jest-rtl/)

## Example tests:

Here are some example tests for how one could test the following `<Header>` component

**client/src/components/Header/index.js**
```
export const Header = props => {
  const { botStatus, setBotStatus, openStorageExplorer } = props;
  return (
    <header css={header}>
      <div css={aside}>Composer</div>
      <div css={actionButton}>
        <ActionButton css={actionButton} iconProps={{ iconName: 'CirclePlus', iconColor: '#ffffff' }}>
          New
        </ActionButton>
        <ActionButton
          css={actionButton}
          iconProps={{ iconName: 'OpenFolderHorizontal', iconColor: '#ffffff' }}
          onClick={() => openStorageExplorer()}
        >
          Open
        </ActionButton>
      </div>
      <div css={bot}>
        <span css={botMessage}>{botStatus === 'running' ? 'Bot is running at http://localhost:3979' : ''}</span>
        <PrimaryButton
          css={botButton}
          text={botStatus === 'running' ? 'Stop' : 'Start'}
          onClick={() => setBotStatus(botStatus)}
        />
      </div>
    </header>
  );
};
```
---
### Testing for text content:

**client/\_\_tests__/header.test.js**
   
  ```
  it('should render the header', async () => {
    const { getByText } = render(<Header />);

    await waitForElement(() => getByText(/Composer/));
    await waitForElement(() => getByText(/New/));
    await waitForElement(() => getByText(/Open/));
  });
  ```

  In this case, the first line renders `<Header>` component, and extracts a special query method, `getByText`, from the result:

  ```
  const { getByText } = render(<Header />);
  ```
    
  This method allows us to search the rendered component for nodes containing text matching a string, regular expression, or matching function. The next 3 lines search for nodes containing "Composer," "New," and "Open:"

  ```
  await waitForElement(() => getByText(/Composer/));
  await waitForElement(() => getByText(/New/));
  await waitForElement(() => getByText(/Open/));
  ```

    
  > **NOTE:** The method `waitForElement` simply waits until the component is rendered, performs the inner function, and returns the result.

  > **NOTE:** Queries such as `getByText()` will throw an error if the DOM node is not found, so there is no need to assert anything.
  ---

  ### Test **firing events** such as clicks and key presses:

  **client/\_\_tests__/header.test.js**

  ```
  it('should open storage explorer', async () => {
    const mockOpenStorageExplorer = jest.fn(() => null);
    const { getByText } = render(<Header openStorageExplorer={mockOpenStorageExplorer} />);
    const openButton = await waitForElement(() => getByText(/Open/));
    fireEvent.click(openButton);
    expect(mockOpenStorageExplorer).toHaveBeenCalled();
  });
  ```
    
  In this example, the first two lines create a mock Jest function to pass into the component as the prop `openStorageExplorer`, and then render the component:

  ```
  const mockOpenStorageExplorer = jest.fn(() => null);
  const { getByText } = render(<Header openStorageExplorer={mockOpenStorageExplorer} />);
  ```
    
  The next line grabs a reference to the button labelled "Open" from the rendered component:

  ```  
  const openButton = await waitForElement(() => getByText(/Open/));
  ```

  Finally, we fire a click event on the "Open" button which should then call the mocked function that we passed in earlier. So we assert that the function was called:

  ```
  fireEvent.click(openButton);
  expect(mockOpenStorageExplorer).toHaveBeenCalled();
  ```

