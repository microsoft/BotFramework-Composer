import { insert, deleteNode } from '../../src/shared/jsonTracker';

describe('insert', () => {
  const path = 'foo.bar';
  let dialog;

  beforeEach(() => {
    dialog = { foo: {} };
  });

  describe('when data already exists', () => {
    beforeEach(() => {
      dialog.foo.bar = [{ $type: 'firstOne' }, { $type: 'secondOne' }];
    });

    it('inserts into the correct position', () => {
      const updated = insert(dialog, path, 1, 'newOne');
      expect(updated.foo.bar).toEqual([
        {
          $type: 'firstOne',
        },
        {
          $type: 'newOne',
          $designer: { id: expect.any(String) },
        },
        {
          $type: 'secondOne',
        },
      ]);
    });

    it('inserts into front if position is less than 0', () => {
      const updated = insert(dialog, path, -2, 'newOne');
      expect(updated.foo.bar).toEqual([
        {
          $type: 'newOne',
          $designer: { id: expect.any(String) },
        },
        {
          $type: 'firstOne',
        },
        {
          $type: 'secondOne',
        },
      ]);
    });

    it('inserts into end if position is greater than length', () => {
      const updated = insert(dialog, path, 10, 'newOne');
      expect(updated.foo.bar).toEqual([
        {
          $type: 'firstOne',
        },
        {
          $type: 'secondOne',
        },
        {
          $type: 'newOne',
          $designer: { id: expect.any(String) },
        },
      ]);
    });

    it('inserts at end if position is undefined', () => {
      const updated = insert(dialog, path, undefined, 'newOne');
      expect(updated.foo.bar).toEqual([
        {
          $type: 'firstOne',
        },
        {
          $type: 'secondOne',
        },
        {
          $type: 'newOne',
          $designer: { id: expect.any(String) },
        },
      ]);
    });
  });

  describe('when data does not exist', () => {
    it('inserts a new array with one element', () => {
      const path = 'foo.bar';

      const updated = insert(dialog, path, 0, 'newOne');

      expect(updated.foo.bar).toEqual([{ $type: 'newOne', $designer: { id: expect.any(String) } }]);
    });
  });
});

describe('deleteNode', () => {
  let dialog, path, removeLgTemplate;
  beforeEach(() => {
    dialog = { foo: { bar: [{ $type: 'firstOne' }, { $type: 'secondOne' }] } };
    removeLgTemplate = jest.fn();
  });

  it('when data does not exist', () => {
    path = null;
    const result = deleteNode(dialog, path, removeLgTemplate);

    expect(result).toEqual(dialog);
  });

  describe('when data exist', () => {
    it('currentKey type is number', () => {
      path = 'foo.bar[0]';
      const result = deleteNode(dialog, path, removeLgTemplate);

      expect(result).toEqual({ foo: { bar: [{ $type: 'secondOne' }] } });
    });
    it('currentKey type is string', () => {
      path = 'foo.bar';
      const result = deleteNode(dialog, path, removeLgTemplate);

      expect(result).toEqual({ foo: {} });
    });
    it("removeLgTemplate be called when deleteNode's $type is 'Microsoft.SendActivity' && activity includes '[bfdactivity-'", () => {
      dialog.foo.activityNode = { $type: 'Microsoft.SendActivity', activity: '[bfdactivity-a]' };
      path = 'foo.activityNode';
      const result = deleteNode(dialog, path, removeLgTemplate);

      expect(removeLgTemplate).toBeCalledWith('common', 'bfdactivity-a');
      expect(result).toEqual({ foo: { bar: [{ $type: 'firstOne' }, { $type: 'secondOne' }] } });
    });
  });
});
