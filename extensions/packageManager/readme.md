# Package manager

Much of modern software development relies on the ability to reuse and build upon existing code. Composer's Package manager feature allows you to find and install packages of prebuilt features for use in your bots.

Installed packages will add new features like additional customizable dialogs, LG templates, and custom actions for your bot to use, and for you to customize in Composer.

From the Package manager interface, you can view a list of currently available packages and choose to install them into the currently selected bot. It is also possible to add an unlisted package directly from the package registries by specifying it by name. Packages already installed can also be viewed, updated and removed.

To install and manage these packages, Composer uses the native package management tools and files available for supported programming languages - NuGet for C# projects and NPM for JavaScript projects.

# Packages

Bot Framework packages are the same type of software packages found on popular package registries like NuGet and NPM. In fact, Composer uses these tools internally to host, install and manage packages.

Each package can contain one or more components and/or declarative assets for bots to use, including customizable dialogs, lg templates, and custom actions. When a package is installed, the assets it contains are copied into the project so they can be used by the bot, and customized in Composer. The source and version of each installed package is tracked so imported assets can be updated if a new version is released.

# Install packages

There are two ways to install a package into a bot: via the Package manager feature in Composer, or via the command line tools. Both processes have the same outcome and compatible with one another, so you can choose the method best suited to your task. Make sure you have an ejected runtime before installing the packages.

## With the Package manager interface

In the main Package manager interface, there is a list of available packages broken into categories. Compatible packages can be installed into a bot by clicking the "Install" button.

If you know the name of a package you want to install, click the "+ Install Package" button at the top of the screen. Using the toolbar button, you can install any version of any package - not just those listed in the "Browse" section.

Since Composer supports multiple programming languages, make sure that the programming language selection matches that of your bot's ejected runtime. You can switch between the available languages to view available packages, but only those that are compatible with your runtime can be installed.

Composer may experience problems importing new packages - for example, a package may contain an incompatible or conflicting asset. If a problem occurs, Composer will ask for confirmation before taking any destructive action such as overwriting an existing file.

## From the command line

To install packages from the command line, use the normal package installation tool for your bot's programming language:

**With a Node.js runtime:**

Navigate to the runtime folder and run:

```bash
cd runtime
npm install --save [some package]
```

**With a C# runtime:**

Navigate to the runtime folder and run:

```bash
cd runtime/azurewebapp
dotnet add package [some package] --version=[some version]
```

After running one of these commands, the package will be listed in the appropriate place, either the `package.json` or the `.csproj` file of the project. Now, use the Bot Framework CLI tool to extract any included dialog, lu and lg files, as well as to merge any new schema items. Run the following command:

```
bf dialog:merge [package.json or .csproj] --imports ../dialogs/imported --output ../schemas/sdk
```

The output of the CLI tool will include a list of the files that were added, deleted or updated. Note that **changes to existing files will be overwritten if newer versions are found in a package.**

# Additional documentation

- [Packages](https://docs.microsoft.com/composer/concept-packages)
- [Creating components](https://docs.microsoft.com/composer/concept-extend-with-code)
