import { moveFocusNode } from '../../src/utils/cursorTraker';
import { mockData } from '../jestMocks/obiDataMock';
import { KeyboardCommandTypes } from '../../src/constants/KeyboardCommandTypes';
import { Children } from 'react';

describe('moveFocusNode', () => {
  let path;
  describe('move left', () => {
    it('when focused node is the leftmost node and action is left', () => {
      path = `rules[0].steps[2].steps[0]`;
      expect(moveFocusNode(mockData, path, KeyboardCommandTypes.MoveLeft)).toEqual(path);
    });
    it("when focused node's parent has another branch children node and focuse node isn't the leftmost one", () => {
      path = `rules[0].steps[2].elseSteps[0]`;
      expect(moveFocusNode(mockData, path, KeyboardCommandTypes.MoveLeft)).toEqual('rules[0].steps[2].steps[0]');
    });
  });
  describe('move right', () => {
    it('when focused node is the rightmost node', () => {
      path = `rules[0].steps[2].elseSteps[0]`;
      expect(moveFocusNode(mockData, path, KeyboardCommandTypes.MoveRight)).toEqual(path);
    });
    it("when focused node's parent has another branch children node and focuse node isn't the rightmost one", () => {
      path = `rules[0].steps[2].steps[0]`;
      expect(moveFocusNode(mockData, path, KeyboardCommandTypes.MoveRight)).toEqual('rules[0].steps[2].elseSteps[0]');
    });
  });
  describe('move up', () => {
    it('cursor keeps still when focused node is the first node', () => {
      path = `rules[0]`;
      expect(moveFocusNode(mockData, path, KeyboardCommandTypes.MoveUp)).toEqual(path);
    });
    it('cursor move to previous node when the previous node has no children node', () => {
      path = `rules[0].steps[1]`;
      expect(moveFocusNode(mockData, path, KeyboardCommandTypes.MoveUp)).toEqual('rules[0].steps[0]');
    });
    it('cursor move to previous node last children node when the previous node has children node', () => {
      path = `rules[0].steps[3]`;
      expect(moveFocusNode(mockData, path, KeyboardCommandTypes.MoveUp)).toEqual('rules[0].steps[2].steps[0]');
    });
  });
  describe('move down', () => {
    it('curse keeps still when focused node is the last node', () => {
      path = `rules[0].steps[4]`;
      expect(moveFocusNode(mockData, path, KeyboardCommandTypes.MoveDown)).toEqual(path);
    });
    it("cursor move to parent'next node when the focus node has no next sibling node", () => {
      path = `rules[0].steps[0]`;
      expect(moveFocusNode(mockData, path, KeyboardCommandTypes.MoveDown)).toEqual('rules[0].steps[1]');
    });
    it('cursor move to first children node when the focus node has children node', () => {
      path = `rules[0].steps[2]`;
      expect(moveFocusNode(mockData, path, KeyboardCommandTypes.MoveDown)).toEqual('rules[0].steps[2].steps[0]');
    });
    it('cursor move to next node when the focus node has next sibling node', () => {
      path = `rules[0].steps[2].steps[0]`;
      expect(moveFocusNode(mockData, path, KeyboardCommandTypes.MoveDown)).toEqual('rules[0].steps[3]');
    });
  });
});
