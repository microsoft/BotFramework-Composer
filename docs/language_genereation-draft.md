# Language Generation

## Overview
In Bot Composer, language generation to generate response activity, in other words, what your bot says to the user. This is a template used to create the outgoing message. It can include language generation rules, properties from memory, and other features. Visit the [Language Generation reference](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md) for more info. Composer natively supports LG. No additional packages need to be installed. 

Lg for ignite will include definition in lg in a more technology agnostic way. We are introducing a concept of structured template. Right now in lg you can do a simple response template, which is one-off variation, or you can do a conditional template, which has IF…ELSE, SWITH CASE…inside the template definition. In this issue  introduces a structured lg template to define a full blown outgoing activity in a simple text format, which gives more clarity of the components parts that are defined and controlled in the template. 

// (include LG in action briefly)

<!-- ### Language Generatin in action 
  - we use language generation in different ways when built a bot 
  - stept to do
    - create [.lg file](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md) to cover possible scenarios when use language generation sub-system
    - include platform specific language generation library as necessary
    - load tempalte manager with your .lg files 
    - when need tempalte expansion, call the templateEngine and pass in relevate template name -->

## Tamplate 

- template expansion and entity substitution (at the core)
- allows developers to extract embedded strings from code and resource files 
- allows developers to manage them through a LG runtime and file format
- you provide one variation for expansion and conditionally expand a template

### Characteristics 

- One or more text response 
// if you have more than one, one is picked by random
- One or more template references (composition)
- One or more expressions 
  - Common expression language
  - Reference to a property {foo}
- Templates can be parametrized
- Template = function.

// templates are functions, which return one of the variations of the text, but fully resolve any other references to template for composition. It can have one more expressions so when it is a conditional template, those expressions control which particular collection of variations get picked. They can be parameterized, which means a template such as {foo} which is called in two different places, one the explicit value, one with the implicit property. 

### Types 

- Simple template
- Conditional template
// these two just for display text. 
- Structured template
  - Speak .vs. display .vs. card .vs. suggested action .vs. input hint

## Import 

- [description text](file/uri path)
 
## Defining LG template in Composer
Composer natively supports LG. When you add a dialog, we automatically will create a .dialog file, .lu file and (not now but pretty soon) a .lg file. For now, all LG content goes in ‘common.lg’ file (point in time implementation of what we have). // briefly cover .lg, .lu and .dialog in source code. 
### LG editor in Composer 
- inline 
- bot says 

- source code
### Need to know
- LG file format
- Supported concepts (template, import)
- Common expression language
### Single template  
  - a single line response
  - multi-line response 
### Conditional template  
  - IF...ELSE
  - SWITCH...CASE
### Structured template  
  - Cards 
  <!-- a layer above .lg will use to construct a full blown [activity](https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-activity.md) -->

<!-- ### LG for text output 
- Single line output (with escape character)
- Multiple line output (triple dash)
- conditional template 
- template as parameter
- cards  -->
<!-- 
- LG is achieved through
  - markdown based .lg file that describes the templates and theri composition
    - [LG file format](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md) 
    - full access to bot memory so that data bind language to state of memory
    - parser and runtime libraries that elp achieve runtime resolution. 
      - [API reference for LG](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/api-reference.md) -->
 
### Common Expression Cheatsheet 

| Symbol     | Description   | 
| -------------------- | ------------------| 
| #  | template definition symbol| 
| -  | variation| 
| \ | Escape character| 
| @ | a prefix character to signify need expression evaluation when in multi-line response 
| {}| Used for all expressions. Note: templates are also functions so {templateName()} is valid and supported.| 
| [] | Short hand to refer to a template. [templateName()] is the same as {templateName()} 
| () | Used to denote parameters to a function or to a template. E.g {templateName(‘value1’, ‘value2’)} or to a prebuilt function {length(foo)} or {length(‘value1’)} 
| ```  | Used in pair to denote multi-line segment. | 


## References
- [language generation preview](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/language-generation) 
- [language generation](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/adaptive-dialog/docs/language-generation.md)
- [LG file format](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md)
- [LG API reference](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/api-reference.md)
- [Common Expression Language](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language#readme)
- [Common Expression Language prebuilt functions](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/common-expression-language/prebuilt-functions.md)

## Next 
- [Using memory](https://github.com/microsoft/BotFramework-Composer/blob/master/docs/using_memory.md)