// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fetch from 'node-fetch';
import { BotTemplateV2 } from '@botframework-composer/types';

export async function getNugetTemplates(): Promise<BotTemplateV2[]> {
  try {
    // Grab search Root URL from service index
    // const res = await fetch('https://api.nuget.org/v3/index.json');
    // const data = await res.json();
    // let rootUrl = '';
    // if (isArray(data.resources) && data.resources.length > 0) {
    //   rootUrl = data.resources.filter((entry) => {
    //     if (entry.type == 'SearchQueryService') {
    //       rootUrl = entry.id;
    //     }
    //   });
    // }
    const query = 'conversationalCore';
    const res = await fetch(`https://azuresearch-usnc.nuget.org/query?q=${query}`);
    const data = await res.json();

    if (Array.isArray(data.data) && data.totalHits > 0) {
      const result: BotTemplateV2[] = data.data.map((entry) => {
        return {
          id: entry.id,
          name: entry.title,
          description: entry.description,
          package: {
            packageName: entry.id,
            packageSource: 'nuget',
          },
        } as BotTemplateV2;
      });
      return result;
    } else {
      return [];
    }
  } catch (err) {
    return [];
  }
}
