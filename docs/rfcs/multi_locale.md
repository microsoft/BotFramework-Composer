### Multi-locale LG & LU authoring in Composer

---

The following RFC is intended to be guided by the following scenarios to be supported in Composer:

1. I can create, modify, or delete a .lg or .lu file for a dialog or create a common.lg file in a language of my choosing.
2. I can set the language for assets to be rendered in the authoring surface and forms.
3. If the Shell cannot find the configured language, the original authored language of the asset will be used.
4. I can create a full set of files in a language (base -> target(s)) that copies base as target(s) initial implementation.
5. I can copy all Bot directory assets to a location of my choosing.
6. I can load Bot Assets to replace the current assets if identical files exist to over-write implementations with new or modified versions

##### Implementation:

Providing a good experience to allow translations of these files can be complex. In considering the UX to provide support for language specific .lg and .lu files, we should take the opportunity to consider what has become convention for how Composer bot assets are represented on the filesytem. This RFC lays out different options to write files to disk logically and proposes an update to the current convention.

The distribution of .lg and .lu files in a set of Composer assets currently look like the following:

```
/ComposerDialogs
  /common
    common.lg
  /Main
    Main.dialog
    Main.lg
    Main.lu
  /DialogFoo
    DialogFoo.dialog
    DialogFoo.lg
    DialogFoo.lu
  /DialogBar
    DialogBar.dialog
    DialogBar.lg
    DialogBar.lu
  /DialogBaz
    DialogBaz.dialog
    DialogBaz.lg
    DialogBaz.lu
```

##### Problem

We want to allow an editing experience for these files as well as allow a user to add .lg and .lu in different languages and make sensible choices on the user's behalf in how we structure the asset directory.

What this would look like in today's file representation:

```
/ComposerDialogs
  /common
    common.en-us.lg
    common.fr.lg
    common.de.lg
  /Main
    Main.dialog
    Main.en-us.lg
    Main.fr.lg
    Main.de.lg
    Main.lu
  /DialogFoo
    DialogFoo.dialog
    DialogFoo.en-us.lg
    DialogFoo.fr.lg
    DialogFoo.de.lg
    DialogFoo.lu
  /DialogBar
    DialogBar.dialog
    DialogBar.en-us.lg
    DialogBar.fr.lg
    DialogBar.de.lg
    DialogBar.lu
  /DialogBaz
    DialogBaz.dialog
    DialogBaz.en-us.lg
    DialogBaz.fr.lg
    DialogBaz.de.lg
    DialogBaz.lu
```

##### Issues with current file structure

Representing the .lu and .lg locally with the .dialog file is logical in that it better places the files where they are being used. This makes a Dialog directory more portable in a world where Dialogs are not only used in a single bot. This file structure is a natural place to graduate to a system where Dialogs hold their own dependencies (.lu, .lg) and can be published or shared outside of the current bot.

A example downside of this approach is that this distribution of files may not be set up for domain specific work in one of the file-formats. One could prefer that all the .lg files exist in its own directly, and all the .lg files exist in its own directory, or all "en-us" files live in an "en-us" directory, and so on. Because of the anticipation of a Dialog and its associated content files (.lu, .lg) are intended to be shared via mechanisms currently planned to be built, a structure to imply a tigher binding between .dialog, .lg, .lu is currently the preferred approach.

##### Note

1. This proposal only applies to a filesystem-based storage plugin, and has little bearing on a database-backed store plugin implementation. **It may have merit to choose a structure that better aligns with a database-driven index approach.**
2. This is ideally the final time we make a significant naming or serialization decision before Composer hits GA. If we wanted to, for example, lowercass files and/or directories, this would be the time to do it.

##### Alternative structures

1. Assets partitioned based on dialog and dependent assets

Benefit: Dependency encapsulation, recursive, convention can be applied to scenarios like publishing local dialogs and associated dependencies, or pulling down dialogs and associated dependencies from a external/third-party source.

```
/coolbot
  main.dialog
  /language-generation
    /en-us
      common.en-us.lg
      main.en-us.dialog
  /language-understanding
    main.en-us.lu
  /dialogs
    /foo
      foo.dialog
      /language-generation
        /en-us
          foo.en-us.dialog
      /language-understanding
        foo.en-us.lu
```

2. Assets partitioned by asset type

Benefit: Physically maps to a content editing scenario (.lu, .lg)

```
/coolbot
  /dialogs
    main.dialog
    foo.dialog
    bar.dialog
    baz.dialog
  /language-generation
    /en-us
      common.en-us.lg
      main.en-us.lg
      foo.en-us.lg
      bar.en-us.lg
      baz.en-us.lg
  /language-understanding
    /en-us
      main.en-us.lu
      foo.en-us.lu
      bar.en-us.lu
      baz.en-us.lu
```

##### Important consideration:

When attempting file lookups, we should try and be agnostic to the file structure as much as possible, in trying to support the scenario where one authors these assets outside of Composer. We shouldn't limit the realistic scenario that users would wish to author files in a different text editor or IDE and load them into Composer expecting a full experience. To fully support this, we aim to utilize the Adaptive Dialog ResourceManager and supporting modules so there is near to exact parity in how the runtime and authoring surface do file lookups and resolution. Whatever we choose for a directory convention, we should not hardcode it into the resolution logic.
