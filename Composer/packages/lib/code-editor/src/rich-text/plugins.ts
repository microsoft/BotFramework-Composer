// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Markdown from '@ckeditor/ckeditor5-markdown-gfm/src/markdown';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Emoji from '@wwalc/ckeditor5-emoji/src/emoji';

const imagePlugins = [Image, ImageToolbar, ImageInsert];

export const richEditorPluginsConfig = [
  Markdown,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Strikethrough,
  Essentials,
  Link,
  List,
  Emoji,
  ...imagePlugins,
];
