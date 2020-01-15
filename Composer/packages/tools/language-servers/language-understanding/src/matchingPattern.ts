// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function getMLEntities(text: string): string[] {
  const lines = text.split('\n');

  const mlEntityRegExp = /^\s*@\s*ml\s*([0-9a-zA-Z_.-]+)\s*.*$/;
  const mlEntities: string[] = [];
  for (const line of lines) {
    if (mlEntityRegExp.test(line)) {
      const entityGroup = line.match(mlEntityRegExp);
      if (entityGroup && entityGroup.length >= 2) {
        mlEntities.push(entityGroup[1]);
      }
    }
  }

  return mlEntities;
}

export function getCompositesEntities(luisJson: any): string[] {
  const suggestionCompositesList: string[] = [];
  if (luisJson !== undefined) {
    if (luisJson.composites !== undefined && luisJson.composites.length > 0) {
      luisJson.composites.forEach(entity => {
        suggestionCompositesList.push(entity.name);
      });
    }
  }

  return suggestionCompositesList;
}

export function matchedEntityCanusesFeature(lineContent: string, text: string, luisJson: any): boolean {
  const mlTypedEntityusesFeature = /^\s*@\s*ml\s*\w*\s*usesFeature\s*$/;
  const compositesTypedEntityusesFeature = /^\s*@\s*composites\s*\w*\s*usesFeature\s*$/;
  const notTypedEntityusesFeature = /^\s*@\s*(\w*)\s*usesFeature\s*$/;
  if (mlTypedEntityusesFeature.test(lineContent) || compositesTypedEntityusesFeature.test(lineContent)) {
    return true;
  } else if (notTypedEntityusesFeature.test(lineContent)) {
    const matchedGroups = lineContent.match(notTypedEntityusesFeature);
    if (matchedGroups && matchedGroups.length >= 2) {
      const entityName = matchedGroups[1];
      const validEntitiesCanusesFeature = getMLEntities(text).concat(getCompositesEntities(luisJson));
      if (validEntitiesCanusesFeature.includes(entityName)) {
        return true;
      }
    }
  }

  return false;
}

export function matchIntentUsesFeatures(content: string): boolean {
  const intentUsesFeaturesRegEx = /^\s*@\s*intent\s*\w*\s*usesFeature\s*$/;
  return intentUsesFeaturesRegEx.test(content);
}

export function matchIntentInEntityDef(content: string): boolean {
  const intentInEntityDefRegEx = /^\s*@\s*intent\s*\w+\s*$/;
  return intentInEntityDefRegEx.test(content);
}

export function isEntityType(content: string): boolean {
  const regexEntifyDef = /^\s*@\s*$/;
  return regexEntifyDef.test(content);
}

export function isPrebuiltEntity(content: string): boolean {
  const regexPrebuiltEntifyDef = /^\s*@\s*prebuilt\s*$/;
  return regexPrebuiltEntifyDef.test(content);
}

export function isRegexEntity(content: string): boolean {
  const regexPrebuiltEntifyDef = /^\s*@\s*regex\s*([\w._]+|"[\w._\s]+")+\s*=\s*$/;
  return regexPrebuiltEntifyDef.test(content);
}

export function isSeperatedEntityDef(content: string): boolean {
  const regexPrebuiltEntifyDef = /^\s*@\s*([\w._]+|"[\w._\s]+")+\s*=\s*$/;
  return regexPrebuiltEntifyDef.test(content);
}

export function isEntityName(content: string): boolean {
  const hasNameEntifyDef = /^\s*@\s*(ml|list|regex|prebuilt|composite|patternany|phraselist)\s*([\w._]+|"[\w._\s]+")\s*$/;
  const hasTypeEntityDef = /^\s*@\s*(ml|list|regex|prebuilt|composite|patternany|phraselist|intent)\s*$/;
  const hasNameEntifyDef2 = /^\s*@\s*([\w._]+|"[\w._\s]+")\s*$/;
  return hasNameEntifyDef.test(content) || (!hasTypeEntityDef.test(content) && hasNameEntifyDef2.test(content));
}

export function isCompositeEntity(content: string): boolean {
  const compositePatternDef = /^\s*@\s*composite\s*[\w]*\s*=\s*\[\s*.*\s*$/;
  const compositePatternDef2 = /^\s*@\s*composite\s*[\w]*\s*=\s*\[\s*.*\s*\]\s*$/;
  return compositePatternDef.test(content) || compositePatternDef2.test(content);
}
export function matchedEnterPattern(content: string): boolean {
  const regexPatternDef = /^\s*-.*{\s*$/;
  const regexPatternDef2 = /^\s*-.*{\s*}$/;
  return regexPatternDef.test(content) || regexPatternDef2.test(content);
}

export function matchedRolesPattern(content: string): boolean {
  const regexRolesPatternDef = /^\s*-.*{\s*.*:/;
  const regexRolesPatternDef2 = /^\s*-.*{\s*.*:}/;
  return regexRolesPatternDef.test(content) || regexRolesPatternDef2.test(content);
}

export function matchedEntityPattern(content: string): boolean {
  const regexRolesEntityPatternDef = /^\s*-.*{\s*@\s*$/;
  const regexRolesEntityPatternDef2 = /^\s*-.*{\s*@\s*}\s*$/;
  return regexRolesEntityPatternDef.test(content) || regexRolesEntityPatternDef2.test(content);
}

export function getRegexEntities(luisJson: any): string[] {
  const suggestionRegexList: string[] = [];
  if (luisJson !== undefined) {
    if (luisJson.regex_entities !== undefined && luisJson.regex_entities.length > 0) {
      luisJson.regex_entities.forEach(entity => {
        suggestionRegexList.push(entity.name);
      });
    }
  }

  return suggestionRegexList;
}

export function getSuggestionEntities(luisJson: any, includePatternAny = true, includeComposites = true): string[] {
  const suggestionEntityList: string[] = [];
  if (luisJson !== undefined) {
    if (luisJson.entities !== undefined && luisJson.entities.length > 0) {
      luisJson.entities.forEach(entity => {
        if (entity.name) {
          suggestionEntityList.push(entity.name);
        }
      });
    }

    if (luisJson.regex_entities !== undefined && luisJson.regex_entities.length > 0) {
      luisJson.regex_entities.forEach(entity => {
        if (entity.name) {
          suggestionEntityList.push(entity.name);
        }
      });
    }

    if (includePatternAny) {
      if (luisJson.patternAnyEntities !== undefined && luisJson.patternAnyEntities.length > 0) {
        luisJson.patternAnyEntities.forEach(entity => {
          if (entity.name) {
            suggestionEntityList.push(entity.name);
          }
        });
      }
    }

    if (luisJson.prebuiltEntities !== undefined && luisJson.prebuiltEntities.length > 0) {
      luisJson.prebuiltEntities.forEach(entity => {
        if (entity.name) {
          suggestionEntityList.push(entity.name);
        }
      });
    }

    if (luisJson.closedLists !== undefined && luisJson.closedLists.length > 0) {
      luisJson.closedLists.forEach(entity => {
        if (entity.name) {
          suggestionEntityList.push(entity.name);
        }
      });
    }

    if (luisJson.phraselists !== undefined && luisJson.phraselists.length > 0) {
      luisJson.phraselists.forEach(entity => {
        if (entity.name) {
          suggestionEntityList.push(entity.name);
        }
      });
    }

    if (includeComposites) {
      if (luisJson.composites !== undefined && luisJson.composites.length > 0) {
        luisJson.composites.forEach(entity => {
          if (entity.name) {
            suggestionEntityList.push(entity.name);
          }
        });
      }
    }
  }

  return suggestionEntityList;
}

export function getSuggestionRoles(luisJson: any): string[] {
  const suggestionRolesList: string[] = [];
  if (luisJson !== undefined) {
    if (luisJson.entities !== undefined && luisJson.entities.length > 0) {
      luisJson.entities.forEach(entity => {
        if (entity.roles !== undefined && entity.roles.length > 0) {
          entity.roles.forEach(role => {
            suggestionRolesList.push(role);
          });
        }
      });
    }

    if (luisJson.regex_entities !== undefined && luisJson.regex_entities.length > 0) {
      luisJson.regex_entities.forEach(entity => {
        if (entity.roles !== undefined && entity.roles.length > 0) {
          entity.roles.forEach(role => {
            suggestionRolesList.push(role);
          });
        }
      });
    }

    if (luisJson.patternAnyEntities !== undefined && luisJson.patternAnyEntities.length > 0) {
      luisJson.patternAnyEntities.forEach(entity => {
        if (entity.roles !== undefined && entity.roles.length > 0) {
          entity.roles.forEach(role => {
            suggestionRolesList.push(role);
          });
        }
      });
    }

    if (luisJson.prebuiltEntities !== undefined && luisJson.prebuiltEntities.length > 0) {
      luisJson.prebuiltEntities.forEach(entity => {
        if (entity.roles !== undefined && entity.roles.length > 0) {
          entity.roles.forEach(role => {
            suggestionRolesList.push(role);
          });
        }
      });
    }

    if (luisJson.closedLists !== undefined && luisJson.closedLists.length > 0) {
      luisJson.closedLists.forEach(entity => {
        if (entity.roles !== undefined && entity.roles.length > 0) {
          entity.roles.forEach(role => {
            suggestionRolesList.push(role);
          });
        }
      });
    }

    if (luisJson.phraselists !== undefined && luisJson.phraselists.length > 0) {
      luisJson.phraselists.forEach(entity => {
        if (entity.roles !== undefined && entity.roles.length > 0) {
          entity.roles.forEach(role => {
            suggestionRolesList.push(role);
          });
        }
      });
    }

    if (luisJson.composites !== undefined && luisJson.composites.length > 0) {
      luisJson.composites.forEach(entity => {
        if (entity.roles !== undefined && entity.roles.length > 0) {
          entity.roles.forEach(role => {
            suggestionRolesList.push(role);
          });
        }
      });
    }
  }

  return suggestionRolesList;
}

export function extractEntityNameInUseFeature(lineContent: string): string {
  const notTypedEntityusesFeature = /^\s*@\s*(\w*)\s*usesFeature\s*/;
  if (notTypedEntityusesFeature.test(lineContent)) {
    const matchedGroups = lineContent.match(notTypedEntityusesFeature);
    if (matchedGroups && matchedGroups.length === 2) {
      const entityName = matchedGroups[1];
      return entityName;
    }
  }

  return '';
}
