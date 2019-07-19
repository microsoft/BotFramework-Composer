import { LGParser, StaticChecker } from 'botbuilder-lg';
import { get } from 'lodash';

export function parse(content, name = '') {
  const resource = LGParser.parse(content, name);
  const diagnostics = StaticChecker.checkText(content, name);
  return {
    templates: get(resource, 'Templates', []),
    diagnostics,
  };
}
