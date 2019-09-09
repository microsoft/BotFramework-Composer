import { moveCursor } from '../../src/utils/cursorTracker';
import { mockData } from '../jestMocks/obiDataMock';
import { KeyboardCommandTypes } from '../../src/constants/KeyboardCommandTypes';
import { ObiFieldNames } from '../../src/constants/ObiFieldNames';

const { Events, Actions, ElseActions } = ObiFieldNames;

describe('#moveCursor', () => {
  let path;
  describe('as action is moveLeft', () => {
    it('keeps still when focused node is the leftmost node', () => {
      path = `${Events}[0].${Actions}[2].${Actions}[0]`;
      expect(moveCursor(mockData, path, KeyboardCommandTypes.MoveLeft)).toEqual(path);
    });
    it("moves to the left node when focused node's parent has another branch children node and focuse node isn't the leftmost one", () => {
      path = `${Events}[0].${Actions}[2].${ElseActions}[0]`;
      expect(moveCursor(mockData, path, KeyboardCommandTypes.MoveLeft)).toEqual(
        `${Events}[0].${Actions}[2].${Actions}[0]`
      );
    });
  });
  describe('as action is moveRight', () => {
    it('keeps still when focused node is the rightmost node', () => {
      path = `${Events}[0].${Actions}[2].${ElseActions}[0]`;
      expect(moveCursor(mockData, path, KeyboardCommandTypes.MoveRight)).toEqual(path);
    });
    it("moves to the right node when focused node's parent has another branch children node and focuse node isn't the rightmost one", () => {
      path = `${Events}[0].${Actions}[2].${Actions}[0]`;
      expect(moveCursor(mockData, path, KeyboardCommandTypes.MoveRight)).toEqual(
        `${Events}[0].${Actions}[2].${ElseActions}[0]`
      );
    });
  });
  describe('as action is moveUp', () => {
    it('keeps still when focused node is the first node', () => {
      path = `${Events}[0]`;
      expect(moveCursor(mockData, path, KeyboardCommandTypes.MoveUp)).toEqual(path);
    });
    it('moves to previous node when the previous node has no children node', () => {
      path = `${Events}[0].${Actions}[1]`;
      expect(moveCursor(mockData, path, KeyboardCommandTypes.MoveUp)).toEqual(`${Events}[0].${Actions}[0]`);
    });
    it('moves to previous node last children node when the previous node has children node', () => {
      path = `${Events}[0].${Actions}[3]`;
      expect(moveCursor(mockData, path, KeyboardCommandTypes.MoveUp)).toEqual(
        `${Events}[0].${Actions}[2].${Actions}[0]`
      );
    });
  });
  describe('as action is moveDown', () => {
    it('keeps still when focused node is the last node', () => {
      path = `${Events}[0].${Actions}[4]`;
      expect(moveCursor(mockData, path, KeyboardCommandTypes.MoveDown)).toEqual(path);
    });
    it("moves to parent'next node when the focus node has no next sibling node", () => {
      path = `${Events}[0].${Actions}[0]`;
      expect(moveCursor(mockData, path, KeyboardCommandTypes.MoveDown)).toEqual(`${Events}[0].${Actions}[1]`);
    });
    it('moves to first children node when the focus node has children node', () => {
      path = `${Events}[0].${Actions}[2]`;
      expect(moveCursor(mockData, path, KeyboardCommandTypes.MoveDown)).toEqual(
        `${Events}[0].${Actions}[2].${Actions}[0]`
      );
    });
    it('moves to next node when the focus node has next sibling node', () => {
      path = `${Events}[0].${Actions}[2].${Actions}[0]`;
      expect(moveCursor(mockData, path, KeyboardCommandTypes.MoveDown)).toEqual(`${Events}[0].${Actions}[3]`);
    });
  });
});
