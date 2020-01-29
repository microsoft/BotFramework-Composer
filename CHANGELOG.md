# Changelog

## Releases

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
