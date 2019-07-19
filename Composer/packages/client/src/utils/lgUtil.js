import { LGParser } from 'botbuilder-lg';
import { get } from 'lodash';

export function parse(content, name = '') {
  try {
    const resource = LGParser.parse(content, name);
    return {
      isValid: true,
      resource,
      error: null,
      errorMsg: '',
    };
  } catch (error) {
    const errorMsg = get(error, 'Diagnostics', []).reduce((msg, error) => {
      const { Start, End } = error.Range;
      const errorDetail = `line ${Start.Line}:${Start.Character} - line ${End.Line}:${End.Character}`;

      msg += `${errorDetail} \n ${error.Message}\n`;
      return msg;
    }, '');
    return {
      isValid: false,
      resource: null,
      error,
      errorMsg,
    };
  }
}
