# Changelog

## Releases

### 03-18-2020

#### Added

- feat: enable composer to call a remote skill ([#2233](https://github.com/microsoft/BotFramework-Composer/pull/2233)) ([@luhan2017](https://github.com/luhan2017))
- feat: Move ([#2206](https://github.com/microsoft/BotFramework-Composer/pull/2206)) ([@cwhitten](https://github.com/cwhitten))
- feat: add luis authoring region in deployment script ([#2229](https://github.com/microsoft/BotFramework-Composer/pull/2229)) ([@zidaneymar](https://github.com/zidaneymar))
- feat: add default alwaysPrompt value in OAuthInput step ([#2266](https://github.com/microsoft/BotFramework-Composer/pull/2266)) ([@alanlong9278](https://github.com/alanlong9278))

#### Fixed

- a11y: #2109 Improve UX and accessibility of deploy dialogs ([#2294](https://github.com/microsoft/BotFramework-Composer/pull/2294)) ([@corinagum](https://github.com/corinagum))
- fix: ErrorMessage can not be displayed in two expression field ([#2278](https://github.com/microsoft/BotFramework-Composer/pull/2278)) ([@alanlong9278](https://github.com/alanlong9278))
- fix: Some editting bugs in Lu editor ([#2285](https://github.com/microsoft/BotFramework-Composer/pull/2285)) ([@cosmicshuai](https://github.com/cosmicshuai))
- fix: composer crashed when delete the dialog ([#2290](https://github.com/microsoft/BotFramework-Composer/pull/2290)) ([@lei9444](https://github.com/lei9444))
- fix: use ':' instead of '=' for prefix ([#2275](https://github.com/microsoft/BotFramework-Composer/pull/2275)) ([@alanlong9278](https://github.com/alanlong9278))
- a11y: #2133 add labels to Learn more links ([#2205](https://github.com/microsoft/BotFramework-Composer/pull/2205)) ([@corinagum](https://github.com/corinagum))
- a11y: Accessibility in lg/lu page ([#2265](https://github.com/microsoft/BotFramework-Composer/pull/2265)) ([@zhixzhan](https://github.com/zhixzhan))
- fix: schema mismatch for message received ([#2248](https://github.com/microsoft/BotFramework-Composer/pull/2248)) ([@alanlong9278](https://github.com/alanlong9278))
- fix: add luis publish status in client ([#2256](https://github.com/microsoft/BotFramework-Composer/pull/2256)) ([@lei9444](https://github.com/lei9444))
- a11y: Accessibility issue ([#2197](https://github.com/microsoft/BotFramework-Composer/pull/2197)) ([@liweitian](https://github.com/liweitian))
- a11y: add ariaLabel props to EditableField and TextFields ([#2259](https://github.com/microsoft/BotFramework-Composer/pull/2259)) ([@beyackle](https://github.com/beyackle))
- fix: beenUsed status in lg all up view ([#2245](https://github.com/microsoft/BotFramework-Composer/pull/2245)) ([@zhixzhan](https://github.com/zhixzhan))
- a11y: adjust id numbers in dialog samples ([#2239](https://github.com/microsoft/BotFramework-Composer/pull/2239)) ([@beyackle](https://github.com/beyackle))
- a11y: make dialog name required ([#2295](https://github.com/microsoft/BotFramework-Composer/pull/2295)) ([@beyackle](https://github.com/beyackle))
- a11y: replace h4 with h1 ([#2271](https://github.com/microsoft/BotFramework-Composer/pull/2271)) ([@alanlong9278](https://github.com/alanlong9278))
- fix: sync oauth input property in form editor ([#2246](https://github.com/microsoft/BotFramework-Composer/pull/2246)) ([@alanlong9278](https://github.com/alanlong9278))
- a11y: add SR labels to Bot Responses "used" column ([#2263](https://github.com/microsoft/BotFramework-Composer/pull/2263)) ([@beyackle](https://github.com/beyackle))
- fix: reset bot connection status when loading a new bot ([#2255](https://github.com/microsoft/BotFramework-Composer/pull/2255)) ([@VanyLaw](https://github.com/VanyLaw))

#### Changed

- chore: update to 4.8 sdk release ([#2296](https://github.com/microsoft/BotFramework-Composer/pull/2296)) ([@luhan2017](https://github.com/luhan2017))
- refactor: support lg templates cross-file copy during Visual Editor copy / paste ([#2236](https://github.com/microsoft/BotFramework-Composer/pull/2236)) ([@yeze322](https://github.com/yeze322))

#### Other

- chore: update bug issue template to create correct label ([#2303](https://github.com/microsoft/BotFramework-Composer/pull/2303)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- chore: change templates to use $type over $kind ([#2302](https://github.com/microsoft/BotFramework-Composer/pull/2302)) ([@cwhitten](https://github.com/cwhitten))
- chore: merge stable into main ([#2223](https://github.com/microsoft/BotFramework-Composer/pull/2223)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- chore: deploy to publish ([#2227](https://github.com/microsoft/BotFramework-Composer/pull/2227)) ([@cwhitten](https://github.com/cwhitten))

### 03-09-2020

#### Added

- feat: Remove input LU when deconstructing prompts ([#2180](https://github.com/microsoft/BotFramework-Composer/pull/2180)) ([@tdurnford](https://github.com/tdurnford))
- feat: Add cross train before luis publish ([#2069](https://github.com/microsoft/BotFramework-Composer/pull/2069)) ([@cwhitten](https://github.com/cwhitten))
- feat: Added inline lu to prompts ([#2159](https://github.com/microsoft/BotFramework-Composer/pull/2159)) ([@cwhitten](https://github.com/cwhitten))
- feat: implement new action design to improve readability ([#2136](https://github.com/microsoft/BotFramework-Composer/pull/2136)) ([@cwhitten](https://github.com/cwhitten))
- feat: repaint ui for setProperties in visual editor ([#2017](https://github.com/microsoft/BotFramework-Composer/pull/2017)) ([@alanlong9278](https://github.com/alanlong9278))
- feat: Update package and schema to 200216 ([#1997](https://github.com/microsoft/BotFramework-Composer/pull/1997)) ([@luhan2017](https://github.com/luhan2017))
- feat: update new trigger modal according to design ([#1786](https://github.com/microsoft/BotFramework-Composer/pull/1786)) ([@liweitian](https://github.com/liweitian))
- feat: display 6 actions as contentless node ([#2108](https://github.com/microsoft/BotFramework-Composer/pull/2108)) ([@yeze322](https://github.com/yeze322))
- feat: support multi-line node block in Visual Editor ([#2005](https://github.com/microsoft/BotFramework-Composer/pull/2005)) ([@yeze322](https://github.com/yeze322))
- feat: add more help links ([#2070](https://github.com/microsoft/BotFramework-Composer/pull/2070)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- feat: support inline LU section editing ([#1994](https://github.com/microsoft/BotFramework-Composer/pull/1994)) ([@zhixzhan](https://github.com/zhixzhan))

#### Fixed

- fix: trigger creation bug ([#2151](https://github.com/microsoft/BotFramework-Composer/pull/2151)) ([@liweitian](https://github.com/liweitian))
- fix: lu build bug when training empty intents ([#2201](https://github.com/microsoft/BotFramework-Composer/pull/2201)) ([@lei9444](https://github.com/lei9444))
- fix: use nightly build to replace the private bf-lu package ([#2190](https://github.com/microsoft/BotFramework-Composer/pull/2190)) ([@lei9444](https://github.com/lei9444))
- fix: Moved value field to user tab and removed inline lu from attachment input ([#2194](https://github.com/microsoft/BotFramework-Composer/pull/2194)) ([@tdurnford](https://github.com/tdurnford))
- fix: load schema files when loading bot project ([#2170](https://github.com/microsoft/BotFramework-Composer/pull/2170)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- fix: deployment script, decouple debugging and deployment settings ([#2153](https://github.com/microsoft/BotFramework-Composer/pull/2153)) ([@zidaneymar](https://github.com/zidaneymar))
- fix: Double scroll bars in dialog's properties pane ([#2163](https://github.com/microsoft/BotFramework-Composer/pull/2163)) ([@alanlong9278](https://github.com/alanlong9278))
- fix: lg template display wrong in visual & form editor ([#2191](https://github.com/microsoft/BotFramework-Composer/pull/2191)) ([@alanlong9278](https://github.com/alanlong9278))
- fix: remove edit button in lu all up view ([#2146](https://github.com/microsoft/BotFramework-Composer/pull/2146)) ([@cwhitten](https://github.com/cwhitten))
- a11y: Use header tag for trigger in visual editor ([#2128](https://github.com/microsoft/BotFramework-Composer/pull/2128)) ([@cwhitten](https://github.com/cwhitten))
- fix: update lu format link ([#2107](https://github.com/microsoft/BotFramework-Composer/pull/2107)) ([@liweitian](https://github.com/liweitian))
- fix: resolve known bugs in LU LSP. ([#2098](https://github.com/microsoft/BotFramework-Composer/pull/2098)) ([@cosmicshuai](https://github.com/cosmicshuai))
- fix: no longer show duplicate lg error notifications ([#2100](https://github.com/microsoft/BotFramework-Composer/pull/2100)) ([@zhixzhan](https://github.com/zhixzhan))
- fix: replace animated screenshots with a static screenshot ([#2045](https://github.com/microsoft/BotFramework-Composer/pull/2045)) ([@benbrown](https://github.com/benbrown))
- fix: support copy actions across dialogs ([#2198](https://github.com/microsoft/BotFramework-Composer/pull/2198)) ([@yeze322](https://github.com/yeze322))
- fix: Default ActivityProcessed to true (bool) ([#2189](https://github.com/microsoft/BotFramework-Composer/pull/2189)) ([@cwhitten](https://github.com/cwhitten))
- a11y: add name for nodeMenu, arrow and endNode ([#2131](https://github.com/microsoft/BotFramework-Composer/pull/2131)) ([@cwhitten](https://github.com/cwhitten))
- a11y: add role, name, posinset for paste in edgeMenu ([#2126](https://github.com/microsoft/BotFramework-Composer/pull/2126)) ([@alanlong9278](https://github.com/alanlong9278))
- fix: fix 'sort()' function of steps and cases in visual editor ([#2166](https://github.com/microsoft/BotFramework-Composer/pull/2166)) ([@yeze322](https://github.com/yeze322))

#### Changed

- style: fix hover state nodes ui ([#2065](https://github.com/microsoft/BotFramework-Composer/pull/2065)) ([@alanlong9278](https://github.com/alanlong9278))

#### Other

- ci: add a11y pr title prefix for accessibility prs ([#2171](https://github.com/microsoft/BotFramework-Composer/pull/2171)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- docs: update docs to fix LU file format link ([#2071](https://github.com/microsoft/BotFramework-Composer/pull/2071)) ([@vishwacsena](https://github.com/vishwacsena))
- chore: merge stable release into main ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- docs: clarify setup ([#2145](https://github.com/microsoft/BotFramework-Composer/pull/2145)) ([@DaraOladapo](https://github.com/DaraOladapo))
- docs: update dotnet requirement in setup docs ([#2160](https://github.com/microsoft/BotFramework-Composer/pull/2160)) ([@vkacherov](https://github.com/vkacherov))
- samples: Update HttpRequest sample ([#2161](https://github.com/microsoft/BotFramework-Composer/pull/2161)) ([@luhan2017](https://github.com/luhan2017))

### 02-21-2020

#### Added

- feat: let VisualEditor accept dynamic uischema instead of hardcoding ([#1995](https://github.com/microsoft/BotFramework-Composer/pull/1995)) ([@yeze322](https://github.com/yeze322))
- feat: multiple lg ([#1861](https://github.com/microsoft/BotFramework-Composer/pull/1861)) ([@zhixzhan](https://github.com/zhixzhan))
- feat: click on a inline lg template error it will navigate to design page and focus on the specific action ([#1856](https://github.com/microsoft/BotFramework-Composer/pull/1856)) ([@liweitian](https://github.com/liweitian))
- feat: syntax highlighting for prebuilt entity name and multi entity definition in one line ([#1882](https://github.com/microsoft/BotFramework-Composer/pull/1882)) ([@cosmicshuai](https://github.com/cosmicshuai))

#### Fixed

- fix: update framework and package version in template botproject ([#1939](https://github.com/microsoft/BotFramework-Composer/pull/1939)) ([@VanyLaw](https://github.com/VanyLaw))
- fix: Updated regex recognizer UI ([#1991](https://github.com/microsoft/BotFramework-Composer/pull/1991)) ([@tdurnford](https://github.com/tdurnford))
- fix: update dialog property title ([#1966](https://github.com/microsoft/BotFramework-Composer/pull/1966)) ([@tdurnford](https://github.com/tdurnford))
- fix: LU LSP suggest empty string entities and roles in entering utterance ([#1889](https://github.com/microsoft/BotFramework-Composer/pull/1889)) ([@cosmicshuai](https://github.com/cosmicshuai))
- fix: use correct widget in ChoiceInput ([#1931](https://github.com/microsoft/BotFramework-Composer/pull/1931)) ([@yeze322](https://github.com/yeze322))
- fix: find lg template id in value ([#1941](https://github.com/microsoft/BotFramework-Composer/pull/1941)) ([@zhixzhan](https://github.com/zhixzhan))
- fix: move field descriptions into tooltip ([#1858](https://github.com/microsoft/BotFramework-Composer/pull/1858)) ([@tdurnford](https://github.com/tdurnford))
- fix: correctly show form errors for switch condition cases ([#2013](https://github.com/microsoft/BotFramework-Composer/pull/2013) & ([#1989](https://github.com/microsoft/BotFramework-Composer/pull/1989)) ([@lei9444](https://github.com/lei9444))
- fix: includeActivity => activityProcessed ([#1996](https://github.com/microsoft/BotFramework-Composer/pull/1996)) ([@alanlong9278](https://github.com/alanlong9278))
- fix: Fix intent dropdown in trigger wizard ([#1949](https://github.com/microsoft/BotFramework-Composer/pull/1949)) ([@cwhitten](https://github.com/cwhitten))
- fix: set consistent titlle ([#1940](https://github.com/microsoft/BotFramework-Composer/pull/1940)) ([@yeze322](https://github.com/yeze322))

#### Changed

- style: left nav and dialog tree align ([#1960](https://github.com/microsoft/BotFramework-Composer/pull/1960)) ([@liweitian](https://github.com/liweitian))
- style: update multiple choice input node style ([#1954](https://github.com/microsoft/BotFramework-Composer/pull/1954)) ([@alanlong9278](https://github.com/alanlong9278))
- style: Adjusted padding in the Form Editor and RootField fonts ([#1973](https://github.com/microsoft/BotFramework-Composer/pull/1973)) ([@tdurnford](https://github.com/tdurnford))
- style: update header size and weight ([#1961](https://github.com/microsoft/BotFramework-Composer/pull/1961)) ([@liweitian](https://github.com/liweitian))
- style: update input node "other" size ([#1950](https://github.com/microsoft/BotFramework-Composer/pull/1950)) ([@alanlong9278](https://github.com/alanlong9278))
- style: update color ([#1959](https://github.com/microsoft/BotFramework-Composer/pull/1959)) ([@liweitian](https://github.com/liweitian))

#### Other

- chore: add client/build to gitignore ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- chore: enhace the SVG usage in visual editor ([#1987](https://github.com/microsoft/BotFramework-Composer/pull/1987)) ([@yeze322](https://github.com/yeze322))
- chore: clean unreferenced files in visual editor ([#1981](https://github.com/microsoft/BotFramework-Composer/pull/1981)) ([@yeze322](https://github.com/yeze322))
- build: add declarationMap compiler option to base ts config ([#1964](https://github.com/microsoft/BotFramework-Composer/pull/1964)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- ci: update cypress libraries ([#1936](https://github.com/microsoft/BotFramework-Composer/pull/1936)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- docs: composer review 1-29 ([#1924](https://github.com/microsoft/BotFramework-Composer/pull/1924)) ([@cwhitten](https://github.com/cwhitten))
- release: 01-27-2020 ([#1913](https://github.com/microsoft/BotFramework-Composer/pull/1913)) ([@cwhitten](https://github.com/cwhitten))
- chore: remove the never used 'when' prop in KeyboardZone ([#2000](https://github.com/microsoft/BotFramework-Composer/pull/2000)) ([@yeze322](https://github.com/yeze322))
- docs: add testing section to contributors doc ([#1955](https://github.com/microsoft/BotFramework-Composer/pull/1955)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))

### 01-27-2020

#### Added

- feat: enrich prebuilt memory paths and add user defined memory paths ([#1868](https://github.com/microsoft/BotFramework-Composer/pull/1868)) ([@lei9444](https://github.com/lei9444))
- feat: Language-Understanding LSP ([#1711](https://github.com/microsoft/BotFramework-Composer/pull/1711)) ([@cosmicshuai](https://github.com/cosmicshuai))
- feat: lu shell api ([#1810](https://github.com/microsoft/BotFramework-Composer/pull/1810)) ([@zhixzhan](https://github.com/zhixzhan))
- feat: Start Botproject runtime in bot folder ([#1672](https://github.com/microsoft/BotFramework-Composer/pull/1672)) ([@VanyLaw](https://github.com/VanyLaw))
- feat: Schema-driven visual editor - migrates 15 simple types ([#1811](https://github.com/microsoft/BotFramework-Composer/pull/1811)) ([@yeze322](https://github.com/yeze322))
- feat: Update OnConversationUpdate actions ([#1794](https://github.com/microsoft/BotFramework-Composer/pull/1794)) ([@luhan2017](https://github.com/luhan2017))
- feat: Update LG and built in expression functions in LSP ([#1790](https://github.com/microsoft/BotFramework-Composer/pull/1790)) ([@Danieladu](https://github.com/Danieladu))
- feat: Add dynamic choices to Choice Prompt ([#1777](https://github.com/microsoft/BotFramework-Composer/pull/1777)) ([@tdurnford](https://github.com/tdurnford))
- feat: update ui for new schema ([#1775](https://github.com/microsoft/BotFramework-Composer/pull/1775)) ([@alanlong9278](https://github.com/alanlong9278))
- feat: lu all up view ux enhancement ([#1879](https://github.com/microsoft/BotFramework-Composer/pull/1879)) ([@zhixzhan](https://github.com/zhixzhan))
- feat: add autoClosingPairs for lg editor ([#1789](https://github.com/microsoft/BotFramework-Composer/pull/1789)) ([@cosmicshuai](https://github.com/cosmicshuai))

#### Fixed

- fix: update the lg content to store when editor editing ([#1884](https://github.com/microsoft/BotFramework-Composer/pull/1884)) ([@lei9444](https://github.com/lei9444))
- fix: Aligned elements in prompt settings ([#1893](https://github.com/microsoft/BotFramework-Composer/pull/1893)) ([@tdurnford](https://github.com/tdurnford))
- fix: remove label from validations ([#1891](https://github.com/microsoft/BotFramework-Composer/pull/1891)) ([@tdurnford](https://github.com/tdurnford))
- fix: Undo / redo behavior on LG resources ([#1813](https://github.com/microsoft/BotFramework-Composer/pull/1813)) ([@lei9444](https://github.com/lei9444))
- fix: botproject build script powershell version limit ([#1857](https://github.com/microsoft/BotFramework-Composer/pull/1857)) ([@VanyLaw](https://github.com/VanyLaw))
- fix: Add support of auto suggestion memory variable ([#1819](https://github.com/microsoft/BotFramework-Composer/pull/1819)) ([@cosmicshuai](https://github.com/cosmicshuai))
- fix: Fixed Multiple Choice Type undo/redo functionality ([#1844](https://github.com/microsoft/BotFramework-Composer/pull/1844)) ([@tdurnford](https://github.com/tdurnford))
- fix: RepeatDialog not shown ([#1835](https://github.com/microsoft/BotFramework-Composer/pull/1835)) ([@yeze322](https://github.com/yeze322))
- fix: do not preset name when creating a dialog ([#1805](https://github.com/microsoft/BotFramework-Composer/pull/1805)) ([@liweitian](https://github.com/liweitian))
- fix: luis authoringRegion not update in popup form ([#1818](https://github.com/microsoft/BotFramework-Composer/pull/1818)) ([@VanyLaw](https://github.com/VanyLaw))
- fix: Check all expressions in dialog ([#1798](https://github.com/microsoft/BotFramework-Composer/pull/1798)) ([@lei9444](https://github.com/lei9444))
- fix: TextWidget hover ([#1825](https://github.com/microsoft/BotFramework-Composer/pull/1825)) ([@tdurnford](https://github.com/tdurnford))
- fix: Create bot from scratch may create a non-empty bot ([#1796](https://github.com/microsoft/BotFramework-Composer/pull/1796)) ([@liweitian](https://github.com/liweitian))
- fix: Updated release version on about page ([#1788](https://github.com/microsoft/BotFramework-Composer/pull/1788)) ([@tdurnford](https://github.com/tdurnford))
- fix: Remove the unused lufiles in notifications ([#1760](https://github.com/microsoft/BotFramework-Composer/pull/1760)) ([@lei9444](https://github.com/lei9444))
- fix: update form correctly when undo or redo changes ([#1808](https://github.com/microsoft/BotFramework-Composer/pull/1808)) ([@lei9444](https://github.com/lei9444))
- fix: handle multiple ctrl+z in lg editor ([#1804](https://github.com/microsoft/BotFramework-Composer/pull/1804)) ([@zhixzhan](https://github.com/zhixzhan))

#### Changed

- refactor: re-provide `getLgTemplates` api ([#1746](https://github.com/microsoft/BotFramework-Composer/pull/1746)) ([@yeze322](https://github.com/yeze322))
- style: updated delete icon ([#1892](https://github.com/microsoft/BotFramework-Composer/pull/1892)) ([@tdurnford](https://github.com/tdurnford))
- refactor: let ElementWrapper control the focus state ([#1880](https://github.com/microsoft/BotFramework-Composer/pull/1880)) ([@yeze322](https://github.com/yeze322))
- refactor: render Elements with composition strategy (ElementRenderer -> ElementWrapper) ([#1873](https://github.com/microsoft/BotFramework-Composer/pull/1873)) ([@yeze322](https://github.com/yeze322))

#### Other

- chore: migrate IfCondition, SwitchCondition, Foreach(Page) to uischema ([#1899](https://github.com/microsoft/BotFramework-Composer/pull/1899)) ([@yeze322](https://github.com/yeze322))
- chore: migrate TextInput and all other \*Input types to uischema ([#1874](https://github.com/microsoft/BotFramework-Composer/pull/1874)) ([@yeze322](https://github.com/yeze322))
- chore: migrate SendActivity, BeginDialog, ReplaceDialog to uischema ([#1840](https://github.com/microsoft/BotFramework-Composer/pull/1840)) ([@yeze322](https://github.com/yeze322))
- chore: retire 'DefaultRenderer' in visual editor ([#1836](https://github.com/microsoft/BotFramework-Composer/pull/1836)) ([@yeze322](https://github.com/yeze322))
- chore: update lu/lg all up view ([#1806](https://github.com/microsoft/BotFramework-Composer/pull/1806)) ([@liweitian](https://github.com/liweitian))
- chore: share server's resource to lsp server ([#1793](https://github.com/microsoft/BotFramework-Composer/pull/1793)) ([@zhixzhan](https://github.com/zhixzhan))
- chore: refactor lg page route & url ([#1756](https://github.com/microsoft/BotFramework-Composer/pull/1756)) ([@zhixzhan](https://github.com/zhixzhan))
- chore: convert ludown to bf-lu ([#1608](https://github.com/microsoft/BotFramework-Composer/pull/1608)) ([@lei9444](https://github.com/lei9444))
- chore: proxy lsp ws request in dev ([#1754](https://github.com/microsoft/BotFramework-Composer/pull/1754)) ([@zhixzhan](https://github.com/zhixzhan))
- docs: fix a typo ([#1901](https://github.com/microsoft/BotFramework-Composer/pull/1901)) ([@HiltonGiesenow](https://github.com/HiltonGiesenow))
- docs: use correct link in events and triggers documentation ([#1832](https://github.com/microsoft/BotFramework-Composer/pull/1832)) ([@arafattehsin](https://github.com/arafattehsin))
- docs: fix memory documentation link and typo ([#1833](https://github.com/microsoft/BotFramework-Composer/pull/1833)) ([@arafattehsin](https://github.com/arafattehsin))
- docs: fix the links to intents and advanced definitions ([#1854](https://github.com/microsoft/BotFramework-Composer/pull/1854)) ([@arafattehsin](https://github.com/arafattehsin))
- chore: bump immer to 5.2.0 ([#1846](https://github.com/microsoft/BotFramework-Composer/pull/1846)) ([@cwhitten](https://github.com/cwhitten))
- chore: update botproject packages ([#1809](https://github.com/microsoft/BotFramework-Composer/pull/1809)) ([@luhan2017](https://github.com/luhan2017))
- chore: update github templates ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- chore: update schema and samples ([@luhan2017](https://github.com/luhan2017))

### 12-10-2019

#### Added

- feat: show error message in form editor. ([#1737](https://github.com/microsoft/BotFramework-Composer/pull/1737)) ([@alanlong9278](https://github.com/alanlong9278))
- feat: link to tab ([#1738](https://github.com/microsoft/BotFramework-Composer/pull/1738)) ([@lei9444](https://github.com/lei9444))
- feat: Deep linking for the notification page ([#1667](https://github.com/microsoft/BotFramework-Composer/pull/1667)) ([@lei9444](https://github.com/lei9444))
- feat: Align with the new design in form for inline error display ([#1683](https://github.com/microsoft/BotFramework-Composer/pull/1683)) ([@alanlong9278](https://github.com/alanlong9278))
- feat: LG LSP in Composer ([#1504](https://github.com/microsoft/BotFramework-Composer/pull/1504)) ([@zhixzhan](https://github.com/zhixzhan))
- feat: Trigger Node ([#1529](https://github.com/microsoft/BotFramework-Composer/pull/1529)) ([@yeze322](https://github.com/yeze322))
- feat: support default path environment variable ([#1652](https://github.com/microsoft/BotFramework-Composer/pull/1652)) ([@liweitian](https://github.com/liweitian))
- feat: add directlinespeech support ([#1637](https://github.com/microsoft/BotFramework-Composer/pull/1637)) ([@xieofxie](https://github.com/xieofxie))

#### Fixed

- fix: minor styling and labeling for linting ux ([#1716](https://github.com/microsoft/BotFramework-Composer/pull/1716)) ([@cwhitten](https://github.com/cwhitten))
- fix: visual editor lg template don't show ([#1707](https://github.com/microsoft/BotFramework-Composer/pull/1707)) ([@zhixzhan](https://github.com/zhixzhan))
- fix: location select Content component ([#1668](https://github.com/microsoft/BotFramework-Composer/pull/1668)) ([@liweitian](https://github.com/liweitian))
- fix: ability to view storages when in local dev on mac ([#1696](https://github.com/microsoft/BotFramework-Composer/pull/1696)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- fix: dialog name incorrect when creating new dialog in form editor ([#1605](https://github.com/microsoft/BotFramework-Composer/pull/1605)) ([@alanlong9278](https://github.com/alanlong9278))
- fix: support horizontal scrolling in visual eidtor ([#1607](https://github.com/microsoft/BotFramework-Composer/pull/1607)) ([@alanlong9278](https://github.com/alanlong9278))
- fix: Fix interruption sample ([#1624](https://github.com/microsoft/BotFramework-Composer/pull/1624)) ([@luhan2017](https://github.com/luhan2017))
- fix: fix minor LG ref syntax in CardSample ([#1749](https://github.com/microsoft/BotFramework-Composer/pull/1749)) ([@boydc2014](https://github.com/boydc2014))
- fix: add fault tolerance for syntax highlighting ([#1690](https://github.com/microsoft/BotFramework-Composer/pull/1690)) ([@cosmicshuai](https://github.com/cosmicshuai))
- fix: lu change doesn't reflect on form editor ([#1704](https://github.com/microsoft/BotFramework-Composer/pull/1704)) ([@zhixzhan](https://github.com/zhixzhan))
- fix: one lg template error mess up others ([#1733](https://github.com/microsoft/BotFramework-Composer/pull/1733)) ([@zhixzhan](https://github.com/zhixzhan))

#### Changed

- style: Updated Array UI ([#1617](https://github.com/microsoft/BotFramework-Composer/pull/1617)) ([@tdurnford](https://github.com/tdurnford))
- style: update visual editor action title style ([#1710](https://github.com/microsoft/BotFramework-Composer/pull/1710)) ([@yeze322](https://github.com/yeze322))
- refactor: upgrade lg parser and syntax ([#1676](https://github.com/microsoft/BotFramework-Composer/pull/1676)) ([@zhixzhan](https://github.com/zhixzhan))
- refactor: centralize lg parsing logic to 'shared' lib ([#1663](https://github.com/microsoft/BotFramework-Composer/pull/1663)) ([@yeze322](https://github.com/yeze322))
- refactor: convert cypress tests to typescript ([#1630](https://github.com/microsoft/BotFramework-Composer/pull/1630)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- style: update LGTheme ([#1706](https://github.com/microsoft/BotFramework-Composer/pull/1706)) ([@cosmicshuai](https://github.com/cosmicshuai))

#### Other

- docs: R7 Doc Release ([#1743](https://github.com/microsoft/BotFramework-Composer/pull/1743)) ([@Kaiqb](https://github.com/Kaiqb))
- docs: update coveralls badge ([#1621](https://github.com/microsoft/BotFramework-Composer/pull/1621)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- ci: disallow opening pr against stable branch unless a release ([#1740](https://github.com/microsoft/BotFramework-Composer/pull/1740)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- build: add ability to configure runtime path ([#1713](https://github.com/microsoft/BotFramework-Composer/pull/1713)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- build: make docker great again ([#1709](https://github.com/microsoft/BotFramework-Composer/pull/1709)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- chore: Adds license fields, fixes incorrect link, hides some left-nav elements ([#1691](https://github.com/microsoft/BotFramework-Composer/pull/1691)) ([@cwhitten](https://github.com/cwhitten))
- chore: update typescript, eslint and prettier ([#1686](https://github.com/microsoft/BotFramework-Composer/pull/1686)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- build: give more memory available to Node in docker ([#1670](https://github.com/microsoft/BotFramework-Composer/pull/1670)) ([@benbrown](https://github.com/benbrown))
- chore: add startup script to check for oudated versions ([#1674](https://github.com/microsoft/BotFramework-Composer/pull/1674)) ([@cwhitten](https://github.com/cwhitten))
- ci: correctly clean up server process after e2e tests ([#1666](https://github.com/microsoft/BotFramework-Composer/pull/1666)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- chore: enforce node >=12 ([#1665](https://github.com/microsoft/BotFramework-Composer/pull/1665)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- ci: run cypress in single job for now ([#1658](https://github.com/microsoft/BotFramework-Composer/pull/1658)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- ci: do not fail CI if coveralls step fails ([#1655](https://github.com/microsoft/BotFramework-Composer/pull/1655)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- chore: reduce form width to 400px ([#1648](https://github.com/microsoft/BotFramework-Composer/pull/1648)) ([@cwhitten](https://github.com/cwhitten))
- chore: bump browserslist ([#1645](https://github.com/microsoft/BotFramework-Composer/pull/1645)) ([@cwhitten](https://github.com/cwhitten))
- test: allow running composer in hosted mode for tests ([#1356](https://github.com/microsoft/BotFramework-Composer/pull/1356)) ([@p-nagpal](https://github.com/p-nagpal))
- ci: include better information in validate-pr action errors ([#1634](https://github.com/microsoft/BotFramework-Composer/pull/1634)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- chore: add browserslist to dependencies ([#1656](https://github.com/microsoft/BotFramework-Composer/pull/1656)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))
- build: make update script cross platform compatible ([#1687](https://github.com/microsoft/BotFramework-Composer/pull/1687)) ([@a-b-r-o-w-n](https://github.com/a-b-r-o-w-n))

### 11-20-2019

#### Added

- linting and validation UI (#1518) (@lei9444)

#### Changed

- improve build speed and bundle size (#1555) (@a-b-r-o-w-n)
- update `Conversation Started` trigger to `Greeting (Conversation Update)` (#1584) (@liweitian)

#### Fixed

- write QnA Maker endpointKey to settings (#1571) (@([@VanyLaw](https://github.com/VanyLaw)))
- fix docs typos (#1575) (@v-kydela)
- prevent double render in visual editor (#1601) (@yeze322)
- fix issue installing lubuild (#1606) (@lei9444)
- fix docker build (#1615) (@cwhitten)
