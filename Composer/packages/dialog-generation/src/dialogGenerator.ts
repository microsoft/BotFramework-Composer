#!/usr/bin/env node
/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as crypto from 'crypto';
import * as os from 'os';
import * as ppath from 'path';

import * as expressions from 'adaptive-expressions';
import * as fs from 'fs-extra';
import * as lg from 'botbuilder-lg';

import * as merger from './mergeAssets';
import * as s from './schema';
import * as ph from './generatePhrases';
import { SubstitutionsEvaluator } from './substitutions';
import { processSchemas } from './processSchemas';
export * from './dialogGenerator';

export enum FeedbackType {
  message,
  info,
  warning,
  error,
  debug,
}

export type Feedback = (type: FeedbackType, message: string) => void;

function templatePath(name: string, dir: string): string {
  return ppath.join(dir, name);
}

function computeHash(val: string): string {
  return crypto.createHash('md5').update(val).digest('hex');
}

// Normalize to OS line endings
function normalizeEOL(val: string): string {
  if (val.startsWith('#!/')) {
    // For linux shell scripts want line feed only
    val = val.replace(/\r/g, '');
  } else if (os.EOL === '\r\n') {
    val = val.replace(/(^|[^\r])\n/g, `$1${os.EOL}`);
  } else {
    val = val.replace(/\r\n/g, os.EOL);
  }
  return val;
}

export function stringify(val: any, replacer?: any): string {
  if (typeof val === 'object') {
    val = normalizeEOL(JSON.stringify(val, replacer, '\t'));
  }
  return val;
}

function computeJSONHash(json: any): string {
  return computeHash(stringify(json));
}

const CommentHashExtensions = ['.lg', '.lu', '.qna'];
const JSONHashExtensions = ['.dialog'];
const GeneratorPattern = /\r?\n> Generator: ([a-zA-Z0-9]+)/;
const ReplaceGeneratorPattern = /\r?\n> Generator: ([a-zA-Z0-9]+)/g;
function addHash(path: string, val: any): any {
  const ext = ppath.extname(path);
  if (CommentHashExtensions.includes(ext)) {
    val = val.replace(ReplaceGeneratorPattern, '');
    if (!val.endsWith(os.EOL)) {
      val += os.EOL;
    }
    val += `${os.EOL}> Generator: ${computeHash(val)}`;
  } else if (JSONHashExtensions.includes(ext)) {
    const json = JSON.parse(val);
    delete json.$Generator;
    json.$Generator = computeJSONHash(json);
    val = stringify(json);
  }
  return val;
}

export async function isUnchanged(path: string): Promise<boolean> {
  let result = false;
  const ext = ppath.extname(path);
  let file = await fs.readFile(path, 'utf8');
  if (CommentHashExtensions.includes(ext)) {
    const match = file.match(GeneratorPattern);
    if (match) {
      const oldHash = match[1];
      file = file.replace(GeneratorPattern, '');
      const hash = computeHash(file);
      result = oldHash === hash;
    }
  } else if (JSONHashExtensions.includes(ext)) {
    const json = JSON.parse(file);
    const oldHash = json.$Generator;
    if (oldHash) {
      delete json.$Generator;
      const hash = computeJSONHash(json);
      result = oldHash === hash;
    }
  }
  return result;
}

export async function writeFile(path: string, val: string, feedback: Feedback, skipHash?: boolean) {
  try {
    const dir = ppath.dirname(path);
    await fs.ensureDir(dir);
    val = normalizeEOL(val);
    if (!skipHash) {
      val = addHash(path, val);
    }
    await fs.writeFile(path, val);
  } catch (e) {
    const match = /position ([0-9]+)/.exec(e.message);
    if (match) {
      const offset = Number(match[1]);
      val = `${val.substring(0, offset)}^^^${val.substring(offset)}`;
    }
    feedback(FeedbackType.error, `${e.message}${os.EOL}${val}`);
  }
}

async function generateFile(path: string, val: any, force: boolean, feedback: Feedback) {
  if (force || !(await fs.pathExists(path))) {
    feedback(FeedbackType.info, `Generating ${path}`);
    await writeFile(path, val, feedback);
  } else {
    feedback(FeedbackType.warning, `Skipping already existing ${path}`);
  }
}

const expressionEngine = new expressions.ExpressionParser((func: string): any => {
  switch (func) {
    case 'phrase':
      return ph.PhraseEvaluator;
    case 'phrases':
      return ph.PhrasesEvaluator;
    case 'substitutions':
      return SubstitutionsEvaluator;
    default:
      return expressions.ExpressionFunctions.standardFunctions.get(func);
  }
});

const generatorTemplate = lg.Templates.parseFile(
  ppath.join(__dirname, '../../templates/', 'generator.lg'),
  undefined,
  expressionEngine
);

// Walk over JSON object, stopping if true from walker.
// Walker gets the current value, the parent object and full path to that object
// and returns false to continue, true to stop going deeper.
async function walkJSON(
  elt: any,
  fun: (val: any, obj?: any, path?: string) => Promise<boolean>,
  obj?: any,
  path?: any
): Promise<void> {
  const done = await fun(elt, obj, path);
  if (!done) {
    if (typeof elt === 'object' || Array.isArray(elt)) {
      for (const key in elt) {
        await walkJSON(elt[key], fun, elt, pathName(path, key));
      }
    }
  }
}

function pathName(path: string | undefined, extension: string): string {
  return path ? `${path}/${extension}` : extension;
}

function setPath(obj: any, path: string, value: any) {
  const key = path.substring(path.lastIndexOf('/') + 1);
  obj[key] = value;
}

type Plain = { source: string; template: string };
type Template = lg.Templates | Plain | undefined;

async function findTemplate(name: string, templateDirs: string[]): Promise<Template> {
  let template: Template;
  for (const dir of templateDirs) {
    let loc = templatePath(name, dir);
    if (await fs.pathExists(loc)) {
      // Direct file
      template = { source: loc, template: await fs.readFile(loc, 'utf8') };
      break;
    } else {
      // LG file
      loc = templatePath(name + '.lg', dir);
      if (await fs.pathExists(loc)) {
        template = lg.Templates.parseFile(loc, undefined, expressionEngine);
        break;
      }
    }
  }
  return template;
}

// Add prefix to [] imports in constant .lg files
const RefPattern = /^[ \t]*\[[^\]\n\r]*\][ \t]*$/gm;
function addPrefixToImports(template: string, scope: any): string {
  return template.replace(RefPattern, (match: string) => {
    const ref = match.substring(match.indexOf('[') + 1, match.indexOf(']'));
    return `[${scope.prefix}-${ref}](${scope.prefix}-${ref})${os.EOL}`;
  });
}

function addPrefix(prefix: string, name: string): string {
  return `${prefix}-${name}`;
}

// Add entry to the .lg generation context and return it.
// This also ensures the file does not exist already.
type FileRef = { name: string; fallbackName: string; fullName: string; relative: string };
function addEntry(fullPath: string, outDir: string, tracker: any): FileRef | undefined {
  let ref: FileRef | undefined;
  const basename = ppath.basename(fullPath, '.dialog');
  const ext = ppath.extname(fullPath).substring(1);
  const arr: FileRef[] = tracker[ext];
  if (!arr.find((ref) => ref.name === basename)) {
    ref = {
      name: basename,
      fallbackName: basename.replace(/\.[^.]+\.lg/, '.lg'),
      fullName: ppath.basename(fullPath),
      relative: ppath.relative(outDir, fullPath),
    };
  }
  return ref;
}

function existingRef(name: string, tracker: any): FileRef | undefined {
  const ext = ppath.extname(name).substring(1);
  let arr: FileRef[] = tracker[ext];
  if (!arr) {
    arr = [];
    tracker[ext] = arr;
  }
  return arr.find((ref) => ref.fullName === name);
}

async function processTemplate(
  templateName: string,
  templateDirs: string[],
  outDir: string,
  scope: any,
  force: boolean,
  feedback: Feedback,
  ignorable: boolean
): Promise<string> {
  let outPath = '';
  const oldDir = process.cwd();
  try {
    const ref = existingRef(templateName, scope.templates);
    if (ref) {
      // Simple file already existed
      feedback(FeedbackType.debug, `Reusing ${templateName}`);
      outPath = ppath.join(outDir, ref.relative);
    } else {
      let foundTemplate = await findTemplate(templateName, templateDirs);
      if (foundTemplate === undefined && templateName.includes('Entity')) {
        // If we can't find an entity, try for a generic definition
        feedback(FeedbackType.debug, `Generic of ${templateName}`);
        templateName = templateName.replace(/.*Entity/, 'generic');
        foundTemplate = await findTemplate(templateName, templateDirs);
      }
      if (foundTemplate !== undefined) {
        const lgTemplate: lg.Templates | undefined =
          foundTemplate instanceof lg.Templates ? (foundTemplate as lg.Templates) : undefined;
        const plainTemplate: Plain | undefined = !lgTemplate ? (foundTemplate as Plain) : undefined;
        // Ignore templates that are defined, but are empty
        if (plainTemplate?.source || lgTemplate?.allTemplates.some((f) => f.name === 'template')) {
          // Constant file or .lg template so output
          feedback(FeedbackType.debug, `Using template ${plainTemplate ? plainTemplate.source : lgTemplate?.id}`);

          let filename = addPrefix(scope.prefix, templateName);
          if (lgTemplate?.allTemplates.some((f) => f.name === 'filename')) {
            try {
              filename = lgTemplate.evaluate('filename', scope) as string;
            } catch (e) {
              throw new Error(`${templateName}: ${e.message}`);
            }
          } else if (filename.includes(scope.locale)) {
            // Move constant files into locale specific directories
            const prop = templateName.startsWith('library')
              ? 'library'
              : filename.endsWith('.qna')
              ? 'QnA'
              : scope.property;
            filename = `${scope.locale}/${prop}/${filename}`;
          } else if (filename.includes('library-')) {
            // Put library stuff in its own folder by default
            filename = `library/${filename}`;
          }

          // Add prefix to constant imports
          if (plainTemplate) {
            plainTemplate.template = addPrefixToImports(plainTemplate.template, scope);
          }

          outPath = ppath.join(outDir, filename);
          const ref = addEntry(outPath, outDir, scope.templates);
          if (ref) {
            // This is a new file
            if (force || !(await fs.pathExists(outPath))) {
              feedback(FeedbackType.info, `Generating ${outPath}`);
              let result = plainTemplate?.template;
              if (lgTemplate) {
                process.chdir(ppath.dirname(lgTemplate.allTemplates[0].sourceRange.source));
                result = lgTemplate.evaluate('template', scope) as string;
                process.chdir(oldDir);
                if (Array.isArray(result)) {
                  result = result.join(os.EOL);
                }
              }

              // See if generated file has been overridden in templates
              const existing = (await findTemplate(filename, templateDirs)) as Plain;
              if (existing?.source) {
                feedback(FeedbackType.info, `  Overridden by ${existing.source}`);
                result = existing.template;
              }

              const resultString = result as string;
              if (resultString.includes('**MISSING**')) {
                feedback(FeedbackType.error, `${outPath} has **MISSING** data`);
              } else {
                const match = resultString.match(/\*\*([^0-9\s]+)[0-9]+\*\*/);
                if (match) {
                  feedback(FeedbackType.warning, `Replace **${match[1]}<N>** with values in ${outPath}`);
                }
              }
              await writeFile(outPath, resultString, feedback);
              scope.templates[ppath.extname(outPath).substring(1)].push(ref);
            } else {
              feedback(FeedbackType.warning, `Skipping already existing ${outPath}`);
            }
          }
        } else if (lgTemplate) {
          if (
            lgTemplate.allTemplates.some((f) => f.name === 'entities') &&
            !scope.schema.properties[scope.property].$entities
          ) {
            const entities = lgTemplate.evaluate('entities', scope) as string[];
            if (entities) {
              scope.schema.properties[scope.property].$entities = entities;
            }
          }
          if (lgTemplate.allTemplates.some((f) => f.name === 'templates')) {
            feedback(FeedbackType.debug, `Expanding template ${lgTemplate.id}`);
            let generated = lgTemplate.evaluate('templates', scope);
            if (!Array.isArray(generated)) {
              generated = [generated];
            }
            for (const generate of (generated as any) as string[]) {
              feedback(FeedbackType.debug, `  ${generate}`);
            }
            for (const generate of (generated as any) as string[]) {
              await processTemplate(generate, templateDirs, outDir, scope, force, feedback, false);
            }
          }
        }
      } else if (!ignorable) {
        feedback(FeedbackType.error, `Missing template ${templateName}`);
      }
    }
  } catch (e) {
    feedback(FeedbackType.error, e.message);
  } finally {
    process.chdir(oldDir);
  }
  return outPath;
}

async function processTemplates(
  schema: s.Schema,
  templateDirs: string[],
  locales: string[],
  outDir: string,
  scope: any,
  force: boolean,
  feedback: Feedback
): Promise<void> {
  scope.templates = {};
  for (const locale of locales) {
    scope.locale = locale;
    for (const property of schema.schemaProperties()) {
      scope.property = property.path;
      scope.type = property.typeName();
      let templates = property.schema.$templates;
      if (!templates) {
        templates = [scope.type];
      }
      for (const template of templates) {
        await processTemplate(template, templateDirs, outDir, scope, force, feedback, false);
      }
      const entities = property.schema.$entities;
      if (!entities) {
        feedback(FeedbackType.error, `${property.path} does not have $entities defined in schema or template.`);
      } else if (!property.schema.$templates) {
        for (const entity of entities) {
          const [entityNamePart, role] = entity.split(':');
          let entityName = entityNamePart;
          scope.entity = entityName;
          scope.role = role;
          if (entityName === `${scope.property}Entity`) {
            entityName = `${scope.type}`;
          }

          // Look for examples in global $examples
          if (schema.schema.$examples) {
            scope.examples = schema.schema.$examples[entityName];
          }

          // Pick up examples from property schema
          if (!scope.examples && property.schema.examples && entities.length === 1) {
            scope.examples = property.schema.examples;
          }

          // If neither specify, then it is up to templates

          await processTemplate(
            `${entityName}Entity-${scope.type}`,
            templateDirs,
            outDir,
            scope,
            force,
            feedback,
            false
          );
        }
        delete scope.entity;
        delete scope.role;
        delete scope.examples;
      }
    }
    delete scope.property;
    delete scope.type;

    // Process templates found at the top
    if (schema.schema.$templates) {
      scope.entities = schema.entityTypes();
      for (const templateName of schema.schema.$templates) {
        await processTemplate(templateName, templateDirs, outDir, scope, force, feedback, false);
      }
    }
  }
  delete scope.locale;
}

// Expand strings with ${} expression in them by evaluating and then interpreting as JSON.
function expandSchema(
  schema: any,
  scope: any,
  path: string,
  inProperties: boolean,
  missingIsError: boolean,
  feedback: Feedback
): any {
  let newSchema = schema;
  if (Array.isArray(schema)) {
    newSchema = [];
    let isExpanded = false;
    for (const val of schema) {
      const isExpr = typeof val === 'string' && val.startsWith('${');
      const newVal = expandSchema(val, scope, path, false, missingIsError, feedback);
      isExpanded = isExpanded || (isExpr && (typeof newVal !== 'string' || !val.startsWith('${')));
      newSchema.push(newVal);
    }
    if (isExpanded && newSchema.length > 0 && !path.includes('.')) {
      // Assume top-level arrays are merged across schemas
      newSchema = Array.from(new Set(newSchema.flat(1)));
      if (typeof newSchema[0] === 'object') {
        // Merge into single object
        let obj = {};
        for (const elt of newSchema) {
          obj = { ...obj, ...elt };
        }
        newSchema = obj;
      }
    }
  } else if (typeof schema === 'object') {
    newSchema = {};
    for (const [key, val] of Object.entries(schema)) {
      let newPath = path;
      if (inProperties) {
        newPath += newPath === '' ? key : '.' + key;
      }
      if (key === '$parameters') {
        newSchema[key] = val;
      } else {
        const newVal = expandSchema(
          val,
          { ...scope, property: newPath },
          newPath,
          key === 'properties',
          missingIsError,
          feedback
        );
        newSchema[key] = newVal;
      }
    }
  } else if (typeof schema === 'string' && schema.startsWith('${')) {
    try {
      const value = generatorTemplate.evaluateText(schema, scope);
      if (value && value !== 'null') {
        newSchema = value;
      } else {
        if (missingIsError) {
          feedback(FeedbackType.error, `Could not evaluate ${schema}`);
        }
      }
    } catch (e) {
      if (missingIsError) {
        feedback(FeedbackType.error, e.message);
      }
    }
  }
  return newSchema;
}

// Get all files recursively in root
async function allFiles(root: string): Promise<Map<string, string>> {
  const files = new Map<string, string>();
  async function walker(dir: string) {
    if ((await fs.lstat(dir)).isDirectory()) {
      for (const child of await fs.readdir(dir)) {
        await walker(ppath.join(dir, child));
      }
    } else {
      files.set(ppath.basename(dir), dir);
    }
  }
  await walker(root);
  return files;
}

// Generate a singleton dialog by pulling in all dialog refs
// NOTE: This does not pull in the recognizers in part because they are only generated when
// publishing.
async function generateSingleton(schema: string, inDir: string, outDir: string) {
  const files = await allFiles(inDir);
  const mainName = `${schema}.main.dialog`;
  const main = await fs.readJSON(files.get(mainName) as string);
  const used = new Set<string>();
  await walkJSON(main, async (elt, obj, key) => {
    if (typeof elt === 'string') {
      const ref = `${elt}.dialog`;
      const path = files.get(ref);
      if (path && key) {
        // Replace reference with inline object
        const newElt = await fs.readJSON(path);
        let id = ppath.basename(path);
        id = id.substring(0, id.indexOf('.dialog'));
        delete newElt.$schema;
        delete newElt.$Generator;
        newElt.$source = id;
        newElt.$Generator = computeJSONHash(newElt);
        setPath(obj, key, newElt);
        used.add(ref);
      }
    }
    return false;
  });
  delete main.$Generator;
  main.$Generator = computeJSONHash(main);
  for (const [name, path] of files) {
    if (!used.has(name)) {
      const outPath = ppath.join(outDir, ppath.relative(inDir, path));
      if (name === mainName && path) {
        await fs.writeJSON(outPath, main, { spaces: '\t' });
      } else {
        await fs.copy(path, outPath);
      }
    }
  }
}

function resolveDir(dirs: string[]): string[] {
  const expanded: string[] = [];
  for (let dir of dirs) {
    dir = ppath.resolve(dir);
    expanded.push(normalize(dir));
  }
  return expanded;
}

// Convert to the right kind of slash.
// ppath.normalize did not do this properly on the mac.
function normalize(path: string): string {
  if (ppath.sep === '/') {
    path = path.replace(/\\/g, ppath.sep);
  } else {
    path = path.replace(/\//g, ppath.sep);
  }
  return ppath.normalize(path);
}

/**
 * Iterate through the locale templates and generate per property/locale files.
 * Each template file will map to <filename>_<property>.<ext>.
 * @param schemaPath Path to JSON Schema to use for generation.
 * @param prefix Prefix to use for generated files.
 * @param outDir Where to put generated files.
 * @param metaSchema Schema to use when generating .dialog files
 * @param allLocales Locales to generate.
 * @param templateDirs Where templates are found.
 * @param force True to force overwriting existing files.
 * @param merge Merge generated results into target directory.
 * @param singleton Merge .dialog into a single .dialog.
 * @param feedback Callback function for progress and errors.
 */
export async function generate(
  schemaPath: string,
  prefix?: string,
  outDir?: string,
  metaSchema?: string,
  allLocales?: string[],
  templateDirs?: string[],
  force?: boolean,
  merge?: boolean,
  singleton?: boolean,
  feedback?: Feedback
): Promise<void> {
  if (!feedback) {
    feedback = (_info, _message) => true;
  }

  if (!prefix) {
    prefix = ppath.basename(schemaPath, '.schema');
  }

  if (!outDir) {
    outDir = ppath.join(prefix + '-resources');
  }

  if (!metaSchema) {
    metaSchema =
      'https://raw.githubusercontent.com/microsoft/botbuilder-samples/master/experimental/generation/runbot/runbot.schema';
  } else if (!metaSchema.startsWith('http')) {
    // Adjust relative to outDir
    metaSchema = ppath.relative(outDir, metaSchema);
  }

  if (!allLocales) {
    allLocales = ['en-us'];
  }

  if (!templateDirs) {
    templateDirs = [];
  }

  if (force) {
    merge = false;
  }

  try {
    if (!(await fs.pathExists(outDir))) {
      // If directory is new, no force or merge necessary
      force = false;
      merge = false;
      await fs.ensureDir(outDir);
    }

    let op = 'Regenerating';
    if (!force) {
      force = false;
      if (merge) {
        op = 'Merging';
      } else {
        merge = false;
        op = 'Generating';
      }
    }
    feedback(FeedbackType.message, `${op} resources for ${ppath.basename(schemaPath, '.schema')} in ${outDir}`);
    feedback(FeedbackType.message, `Locales: ${JSON.stringify(allLocales)} `);
    feedback(FeedbackType.message, `Templates: ${JSON.stringify(templateDirs)} `);
    feedback(FeedbackType.message, `App.schema: ${metaSchema} `);

    let outPath = outDir;
    let outPathSingle = outDir;
    if (merge || singleton) {
      // Redirect to temporary path
      outPath = ppath.join(os.tmpdir(), 'tempNew');
      outPathSingle = ppath.join(os.tmpdir(), 'tempNewSingle');
      await fs.emptyDir(outPath);
      await fs.emptyDir(outPathSingle);
    }

    templateDirs = resolveDir(templateDirs);

    // User templates + cli templates to find schemas
    const startDirs = [...templateDirs];
    const templates = normalize(ppath.join(__dirname, '../../templates'));
    for (const dirName of await fs.readdir(templates)) {
      const dir = ppath.join(templates, dirName);
      if ((await (await fs.lstat(dir)).isDirectory()) && !startDirs.includes(dir)) {
        startDirs.push(dir);
      }
    }

    const schema = await processSchemas(schemaPath, startDirs, feedback);
    schema.schema = expandSchema(schema.schema, {}, '', false, false, feedback);

    // User templates + schema template directories
    const schemaDirs = schema.schema.$templateDirs.map((d) => normalize(d));
    templateDirs = [...templateDirs, ...schemaDirs.filter((d) => !(templateDirs as string[]).includes(d))];

    // Process templates
    let scope: any = {
      locales: allLocales,
      prefix: prefix || schema.name(),
      schema: schema.schema,
      properties: schema.schema.$public,
      triggerIntent: schema.triggerIntent(),
      appSchema: metaSchema,
    };

    if (schema.schema.$parameters) {
      scope = { ...scope, ...schema.schema.$parameters };
    }

    await processTemplates(schema, templateDirs, allLocales, outPath, scope, force, feedback);

    // Expand schema expressions
    const expanded = expandSchema(schema.schema, scope, '', false, true, feedback);

    // Write final schema
    const body = stringify(expanded, (key: any, val: any) =>
      key === '$templates' || key === '$requires' || key === '$templateDirs' || key === '$examples' ? undefined : val
    );
    await generateFile(ppath.join(outPath, `${prefix}.json`), body, force, feedback);

    // Merge together all dialog files
    if (singleton) {
      if (!merge) {
        feedback(FeedbackType.info, 'Combining into singleton .dialog');
        await generateSingleton(scope.prefix, outPath, outDir);
      } else {
        await generateSingleton(scope.prefix, outPath, outPathSingle);
      }
    }

    // Merge old and new directories
    if (merge) {
      if (singleton) {
        await merger.mergeAssets(prefix, outDir, outPathSingle, outDir, allLocales, feedback);
      } else {
        await merger.mergeAssets(prefix, outDir, outPath, outDir, allLocales, feedback);
      }
    }
  } catch (e) {
    feedback(FeedbackType.error, e.message);
  }
}
