// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, fireEvent, act, faker, userEvent } from '@botframework-composer/test-utils';

import { Comment, MAX_CHARS_FOR_SINGLE_LINE } from '../Comment';

describe('<Comment />', () => {
  let onChange: jest.Mock = jest.fn();

  beforeEach(() => {
    onChange = jest.fn();
  });

  it('renders a text field if no comment present', async () => {
    const { findByPlaceholderText, queryByTestId } = render(<Comment onChange={onChange} />);

    const textfield = await findByPlaceholderText('Add a note');

    expect(textfield).toBeVisible();

    expect(queryByTestId('CommentCard')).not.toBeInTheDocument();
  });

  it('renders a textarea if the comment is more than 65 characters', async () => {
    const { findByPlaceholderText } = render(<Comment onChange={onChange} />);

    let textfield = await findByPlaceholderText('Add a note');
    expect(textfield.tagName.toLowerCase()).toEqual('input');

    const text = faker.lorem.paragraph(2).substring(0, MAX_CHARS_FOR_SINGLE_LINE - 1);
    act(() => {
      fireEvent.change(textfield, { target: { value: text } });
    });
    expect(textfield.tagName.toLowerCase()).toEqual('input');
    expect(textfield).toHaveValue(text);

    act(() => {
      fireEvent.change(textfield, { target: { value: text + faker.lorem.words() } });
    });

    textfield = await findByPlaceholderText('Add a note');
    expect(textfield.tagName.toLowerCase()).toEqual('textarea');
  });

  it('can edit an existing comment', async () => {
    const comment = faker.lorem.paragraph();
    const { findByLabelText, findByPlaceholderText, findByText, queryByTestId } = render(
      <Comment comment={comment} onChange={onChange} />
    );

    expect(queryByTestId('CommentCard')).toBeVisible();
    const textfield = await findByPlaceholderText('Add a note');
    expect(textfield).not.toBeVisible();

    const menu = await findByLabelText('Comment menu');
    act(() => {
      userEvent.click(menu);
    });

    const editBtn = await findByText('Edit');
    act(() => {
      userEvent.click(editBtn);
    });
    expect(textfield).toBeVisible();
    expect(textfield).toHaveValue(comment);
    expect(queryByTestId('CommentCard')).not.toBeInTheDocument();

    act(() => {
      userEvent.type(textfield, 'a');
    });

    expect(onChange).toHaveBeenCalledWith(comment + 'a');
  });

  it('can delete a comment', async () => {
    const comment = faker.lorem.paragraph();
    const { findByLabelText, findByPlaceholderText, findByText, queryByTestId } = render(
      <Comment comment={comment} onChange={onChange} />
    );

    expect(queryByTestId('CommentCard')).toBeInTheDocument();
    let textfield = await findByPlaceholderText('Add a note');
    expect(textfield).not.toBeVisible();

    const menu = await findByLabelText('Comment menu');
    act(() => {
      userEvent.click(menu);
    });

    const deleteBtn = await findByText('Delete');
    act(() => {
      userEvent.click(deleteBtn);
    });
    textfield = await findByPlaceholderText('Add a note');
    expect(textfield).toBeVisible();
    expect(onChange).toHaveBeenCalledWith('');
    expect(queryByTestId('CommentCard')).not.toBeInTheDocument();
  });
});
