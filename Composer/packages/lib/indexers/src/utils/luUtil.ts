// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * luUtil.ts is a single place use lu-parser handle lu file operation.
 * Those methods should be implemented as pure function, shall not modify arguments.
 * it's designed have no state, input text file, output text file.
 * for more usage detail, please check client/__tests__/utils/luUtil.test.ts
 */
import { sectionHandler, parser as BFLUParser } from '@microsoft/bf-lu/lib/parser/composerindex';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import merge from 'lodash/merge';
import clone from 'lodash/clone';
import {
  LuFile,
  LuSectionTypes,
  LuIntentSection,
  Diagnostic,
  Position,
  Range,
  DiagnosticSeverity,
  ILUFeaturesConfig,
  LuParseResource,
  TextFile,
  luImportResolverGenerator,
  LUImportResolverDelegate,
} from '@bfc/shared';
import formatMessage from 'format-message';

import { luIndexer } from '../luIndexer';

import { buildNewlineText, getFileName, splitNewlineText } from './help';
import { SectionTypes } from './qnaUtil';

const { luParser, sectionOperator } = sectionHandler;
const { parseFile, validateResource } = BFLUParser;
const NEWLINE = '\r\n';
const OrchestratorEntityPattern = new RegExp(/Do not support (\w+) entity.\.*/);

export const defaultLUFeatures = {
  enablePattern: true,
  enableMLEntities: true,
  enableListEntities: true,
  enableCompositeEntities: true,
  enablePrebuiltEntities: true,
  enableRegexEntities: true,
  enablePhraseLists: true,
  enableModelDescription: true,
  enableExternalReferences: true,
  enableComments: true,
};

// when new add a section in inline editor, the section haven't exist on file context, to make suggestion/validation possiable here mock one.
export const PlaceHolderSectionName = formatMessage(`_NewSectionPlaceHolderSectionName`);

export function convertLuDiagnostic(d: any, source: string, offset = 0): Diagnostic {
  const severityMap = {
    ERROR: DiagnosticSeverity.Error,
    WARN: DiagnosticSeverity.Warning,
    INFORMATION: DiagnosticSeverity.Information,
    HINT: DiagnosticSeverity.Hint,
  };
  const result = new Diagnostic(d.Message, source, severityMap[d.Severity]);

  const start: Position = d.Range
    ? new Position(d.Range.Start.Line - offset, d.Range.Start.Character)
    : new Position(0, 0);
  const end: Position = d.Range ? new Position(d.Range.End.Line - offset, d.Range.End.Character) : new Position(0, 0);
  result.range = new Range(start, end);

  return result;
}

export function convertLuParseResultToLuFile(
  id: string,
  resource: LuParseResource,
  luFeatures: ILUFeaturesConfig,
  importResolver?: LUImportResolverDelegate,
): LuFile {
  // filter structured-object from LUParser result.
  const { Sections, Errors, Content } = resource;
  const intents: LuIntentSection[] = [];
  const fileId = id;
  Sections.forEach((section) => {
    const { Name, Body, SectionType } = section;
    const range = new Range(
      new Position(get(section, 'Range.Start.Line', 0), get(section, 'Range.Start.Character', 0)),
      new Position(get(section, 'Range.End.Line', 0), get(section, 'Range.End.Character', 0)),
    );
    if (SectionType === LuSectionTypes.SIMPLEINTENTSECTION) {
      const Entities = section.Entities.map(({ Name, Type }) => ({ Name, Type }));
      intents.push({ Name, Body, Entities, range, fileId });
    } else if (SectionType === LuSectionTypes.NESTEDINTENTSECTION) {
      const Children = section.SimpleIntentSections.map((subSection) => {
        const { Name, Body } = subSection;
        const range = new Range(
          new Position(get(section, 'Range.Start.Line', 0), get(subSection, 'Range.Start.Character', 0)),
          new Position(get(section, 'Range.End.Line', 0), get(subSection, 'Range.End.Character', 0)),
        );
        const Entities = subSection.Entities.map(({ Name, Type }) => ({ Name, Type }));
        return { Name, Body, Entities, range, fileId };
      });
      intents.push({ Name, Body, Children, range, fileId });
      intents.push(
        ...Children.map((subSection) => {
          return {
            ...subSection,
            Name: `${section.Name}/${subSection.Name}`,
          };
        }),
      );
    }
  });

  const appliedluFeatures = merge(defaultLUFeatures, luFeatures || {});
  if (luFeatures.isOrchestartor) {
    appliedluFeatures.enableCompositeEntities = false;
    appliedluFeatures.enableListEntities = false;
    appliedluFeatures.enableMLEntities = false;
    appliedluFeatures.enablePrebuiltEntities = false;
    appliedluFeatures.enableRegexEntities = false;
  }

  const syntaxDiagnostics = Errors.map((e) => convertLuDiagnostic(e, id)) as Diagnostic[];
  for (const item of syntaxDiagnostics) {
    const reseveredPrebuiltEntittyError = /.*The model name .* is reserved./g;
    if (reseveredPrebuiltEntittyError.test(item.message)) {
      item.severity = DiagnosticSeverity.Warning;
    }
  }

  const semanticDiagnostics = validateResource(resource, appliedluFeatures).map((e) =>
    convertLuDiagnostic(e, id),
  ) as Diagnostic[];

  const imports = Sections.filter(({ SectionType }) => SectionType === SectionTypes.ImportSection).map(
    ({ Path, Description }) => {
      return {
        id: getFileName(Path),
        description: Description,
        path: Path,
      };
    },
  );

  // find all reference and parse them.
  const allIntents: LuIntentSection[] = clone(intents);
  const referenceDiagnostics: Diagnostic[] = [];
  if (importResolver) {
    Sections.filter(({ SectionType }) => SectionType === SectionTypes.ImportSection).forEach((item) => {
      try {
        const targetFile = importResolver(id, item.Path);
        if (targetFile) {
          const targetFileParsed = luIndexer.parse(targetFile.content, targetFile.id, luFeatures, importResolver);
          allIntents.push(...targetFileParsed.allIntents);
        }
      } catch (_error) {
        const res = new Diagnostic(_error.message, item.Path, DiagnosticSeverity.Error, item.Path);
        const start: Position = item.Range
          ? new Position(item.Range.Start.Line, item.Range.Start.Character)
          : new Position(0, 0);
        const end: Position = item.Range
          ? new Position(item.Range.End.Line, item.Range.End.Character)
          : new Position(0, 0);
        res.range = new Range(start, end);
        referenceDiagnostics.push(res);
      }
    });
  }

  let diagnostics = syntaxDiagnostics.concat(semanticDiagnostics).concat(referenceDiagnostics);

  // if is orchestrator, report entity error
  if (luFeatures.isOrchestartor) {
    const orchestatorSemanticDiagnostics: Diagnostic[] = semanticDiagnostics.map((item) => {
      const matchResult = item.message.match(OrchestratorEntityPattern);
      if (matchResult) {
        item.message = `Orchestrator does not support ${matchResult[1]} entities.`;
        item.severity = DiagnosticSeverity.Warning;
      }
      return item;
    });
    diagnostics = syntaxDiagnostics.concat(orchestatorSemanticDiagnostics).concat(referenceDiagnostics);
  }

  return {
    id,
    content: Content,
    empty: !Sections.length,
    intents,
    allIntents,
    diagnostics,
    imports,
    resource: { Sections, Errors, Content },
    isContentUnparsed: false,
  };
}

export function isValid(diagnostics: any[]) {
  return diagnostics.every((item) => item.Severity !== 'ERROR');
}

export function escapeBodyText(body: string, nestedLevel = 1): string {
  const lines = splitNewlineText(body);
  const fixedLines = lines.map((line) => {
    // #hi  -->
    // -\#hi
    // eslint-disable-next-line security/detect-non-literal-regexp
    const reg = new RegExp('^(\\s*)(#{' + nestedLevel + '})([^#])');
    return line.replace(reg, '$1- \\$2$3');
  });
  return buildNewlineText(fixedLines);
}

export function textFromIntent(intent: LuIntentSection | null, nestedLevel = 1, enableSections = false): string {
  if (!intent || isEmpty(intent)) return '';
  let { Name } = intent;
  const { Body } = intent;
  if (Name.includes('/')) {
    const [, childName] = Name.split('/');
    Name = childName;
  }
  const textBuilder: string[] = [];
  if (Name && Body) {
    textBuilder.push(`${'#'.repeat(nestedLevel)} ${Name.trim()}`);

    const escapedBody = escapeBodyText(Body, nestedLevel);
    textBuilder.push(escapedBody);
  }
  let text = textBuilder.join(NEWLINE);
  if (enableSections) {
    const nestedSectionDeclareHeader = `> !# @enableSections = true`;
    text = [nestedSectionDeclareHeader, text].join('\r\n');
  }
  return text;
}

export function textFromIntents(intents: LuIntentSection[], nestedLevel = 1): string {
  return intents.map((intent) => textFromIntent(intent, nestedLevel)).join(`${NEWLINE}${NEWLINE}`);
}

export function checkSection(intent: LuIntentSection, enableSections = true): Diagnostic[] {
  const text = textFromIntent(intent, 1, enableSections);
  const result = luParser.parse(text);
  const { Errors } = result;
  return Errors.map((e) => convertLuDiagnostic(e, '', enableSections ? 1 : 0));
}

export function checkIsSingleSection(intent: LuIntentSection, enableSections = true): boolean {
  const text = textFromIntent(intent, 1, enableSections);
  const { Sections } = luParser.parse(text);
  return Sections.filter((section) => section.SectionType !== LuSectionTypes.MODELINFOSECTION).length === 1;
}

function updateInSections(
  sections: LuIntentSection[],
  intentName: string,
  updatedIntent: LuIntentSection | null,
): LuIntentSection[] {
  // remove
  if (!updatedIntent || isEmpty(updatedIntent)) {
    return sections.filter(({ Name }) => Name !== intentName);
  }
  // add
  if (sections.findIndex(({ Name }) => Name === intentName) === -1) {
    sections.push(updatedIntent);
    return sections;
  }
  // update
  return sections.map((section) => {
    if (section.Name === intentName) {
      return updatedIntent;
    }
    return section;
  });
}

/**
 *
 * @param content origin lu file content
 * @param intentName intent Name, support subSection naming 'CheckEmail/CheckUnreadEmail'. if #CheckEmail not exist will do recursive add.
 * @param {Name, Body} intent the updates. if intent is empty will do remove.
 */
export function updateIntent(
  luFile: LuFile,
  intentName: string,
  intent: { Name?: string; Body?: string } | null,
  luFeatures: ILUFeaturesConfig,
  importResolver?: LUImportResolverDelegate,
): LuFile {
  let targetSection;
  let targetSectionContent;
  const { id, resource } = luFile;
  const { Sections } = resource;

  // if intent is null, do remove
  // and if remove target not exist return origin content;
  if (!intent || isEmpty(intent)) {
    if (intentName.includes('/')) {
      const [parrentName, childName] = intentName.split('/');
      const targetChildSection = Sections.find(({ Name }) => Name === parrentName)?.SimpleIntentSections.find(
        ({ Name }) => Name === childName,
      );
      if (!targetChildSection) {
        return luFile;
      }
    } else {
      const targetSection = Sections.find(({ Name }) => Name === intentName);
      if (targetSection) {
        const result = new sectionOperator(resource).deleteSection(targetSection.Id);
        return convertLuParseResultToLuFile(id, result, luFeatures, importResolver);
      }
      return luFile;
    }
  }

  const orginSection = Sections.find(({ Name }) => Name === intentName);
  const intentToUpdate: LuIntentSection = {
    ...orginSection,
    Name: intent?.Name || orginSection?.Name || intentName,
    Body: intent?.Body || orginSection?.Body || '',
  };

  // nestedSection name path
  if (intentName.includes('/')) {
    const [parrentName, childName] = intentName.split('/');
    targetSection = Sections.find(({ Name }) => Name === parrentName);

    if (targetSection) {
      const updatedSections = updateInSections(targetSection.SimpleIntentSections, childName, intentToUpdate);
      targetSectionContent = textFromIntent({ Name: targetSection.Name, Body: textFromIntents(updatedSections, 2) });
    } else {
      targetSectionContent = textFromIntent({ Name: parrentName, Body: textFromIntent(intentToUpdate, 2) });
    }
  } else {
    targetSection = Sections.find(({ Name }) => Name === intentName);
    targetSectionContent = textFromIntent(intentToUpdate);
  }

  let newResource;
  // update
  if (targetSection) {
    newResource = new sectionOperator(resource).updateSection(targetSection.Id, targetSectionContent);
    // add if not exist
  } else {
    newResource = new sectionOperator(resource).addSection(['', targetSectionContent].join(NEWLINE));
  }
  return convertLuParseResultToLuFile(id, newResource, luFeatures, importResolver);
}

/**
 *
 * @param content origin lu file content
 * @param {Name, Body} intent the adds. Name support subSection naming 'CheckEmail/CheckUnreadEmail', if #CheckEmail not exist will do recursive add.
 */
export function addIntent(
  luFile: LuFile,
  { Name, Body }: LuIntentSection,
  luFeatures: ILUFeaturesConfig,
  importResolver?: LUImportResolverDelegate,
): LuFile {
  const intentName = Name;
  if (Name.includes('/')) {
    const [, childName] = Name.split('/');
    Name = childName;
  }
  // If the invoker doesn't want to carry Entities, don't pass Entities in.
  return updateIntent(luFile, intentName, { Name, Body }, luFeatures, importResolver);
}

export function addIntents(
  luFile: LuFile,
  intents: LuIntentSection[],
  luFeatures: ILUFeaturesConfig,
  importResolver?: LUImportResolverDelegate,
): LuFile {
  let result = luFile;
  for (const intent of intents) {
    result = addIntent(result, intent, luFeatures, importResolver);
  }
  return result;
}

/**
 *
 * @param content origin lu file content
 * @param intentName the remove intentName. Name support subSection naming 'CheckEmail/CheckUnreadEmail', if any of them not exist will do nothing.
 */
export function removeIntent(
  luFile: LuFile,
  intentName: string,
  luFeatures: ILUFeaturesConfig,
  importResolver?: LUImportResolverDelegate,
): LuFile {
  return updateIntent(luFile, intentName, null, luFeatures, importResolver);
}
export function removeIntents(
  luFile: LuFile,
  intentNames: string[],
  luFeatures: ILUFeaturesConfig,
  importResolver?: LUImportResolverDelegate,
): LuFile {
  let result = luFile;
  for (const intentName of intentNames) {
    result = removeIntent(result, intentName, luFeatures, importResolver);
  }
  return result;
}

export function parse(id: string, content: string, luFeatures: ILUFeaturesConfig, luFiles: TextFile[]): LuFile {
  const luImportResolver = luImportResolverGenerator(luFiles, '.lu');
  return luIndexer.parse(content, id, luFeatures, luImportResolver);
}

export async function semanticValidate(
  id: string,
  content: string,
  luFeatures: ILUFeaturesConfig,
): Promise<Diagnostic[]> {
  const appliedConfig = merge(defaultLUFeatures, luFeatures || {});
  const diagnostics: Diagnostic[] = [];

  try {
    await parseFile(content, false, '', appliedConfig);
  } catch (error) {
    const diags = error?.diagnostics?.map((item) => convertLuDiagnostic(item, id));
    if (diags) {
      diagnostics.push(...diags);
    }
  }
  return diagnostics;
}
