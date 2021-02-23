const fs = require('fs-extra');
const path = require('path');

const esbuild = require('esbuild');
const GlobalsPlugin = require('esbuild-plugin-globals');

const getBundleConfigs = (extPath, packageJSON, watch = false) => {
  const buildConfigs = [];

  const watchCb = (entry) =>
    watch
      ? {
          onRebuild(error, result) {
            if (error) {
              console.error('watch build failed:', error);
            } else {
              console.info('[%s] successfully rebuilt', entry);
            }
          },
        }
      : false;

  const defaultConfig = Object.assign(
    {
      bundle: true,
      logLevel: 'error',
      sourcemap: true,
    },
    packageJSON.esbuild
  );

  // check for node entry
  for (const nodeEntry of ['', 'src', 'src/node']) {
    const p = path.join(extPath, nodeEntry, 'index.ts');
    if (fs.pathExistsSync(p)) {
      buildConfigs.push(
        Object.assign(
          { ...defaultConfig },
          {
            entryPoints: [p],
            outfile: path.join(extPath, 'dist/extension.js'),
            platform: 'node',
            target: ['node12.13.0'],
            watch: watchCb('node'),
          }
        )
      );
    }
  }

  // for each contrib, create entry for each file
  const contribs = ['pages', 'publish'];

  for (const contribDir of contribs) {
    const p = path.join(extPath, 'src', contribDir);

    if (fs.pathExistsSync(p)) {
      for (const contrib of fs.readdirSync(p, { withFileTypes: true })) {
        const cPath = path.join(p, contrib.name);

        buildConfigs.push(
          Object.assign(
            { ...defaultConfig },
            {
              outdir: path.join(extPath, './dist'),
              entryPoints: [cPath],
              target: ['es2015'],
              watch: watchCb(contrib.name),
              plugins: [
                GlobalsPlugin({
                  react: 'React',
                  'react-dom': 'ReactDOM',
                  '@bfc/extension-client': 'ExtensionClient',
                  'office-ui-fabric-react': 'Fabric',
                  '@bfc/code-editor': 'CodeEditors',
                  '@bfc/ui-shared': 'UIShared',
                }),
              ],
              loader: {
                '.svg': 'dataurl',
                '.png': 'file',
              },
              define: {
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) || JSON.stringify('development'),
              },
            }
          )
        );
      }
    }
  }

  return buildConfigs;
};

const cleanDist = async (name, extPath) => {
  console.log('[%s] cleaning dist', name);
  await fs.emptyDir(path.join(extPath, 'dist'));
};

const compile = async (name, extPath, watch = false) => {
  const packageJSON = fs.readJsonSync(path.join(extPath, 'package.json'));

  console.log('[%s] compiling', name);
  const work = [];
  const service = await esbuild.startService();

  try {
    await cleanDist(name, extPath);
    for (const config of getBundleConfigs(extPath, packageJSON, watch)) {
      work.push(service.build(config));
    }

    await Promise.all(work);
  } finally {
    service.stop();
  }
};

const buildPackageFromCommandLine = async () => {
  const name = path.basename(process.cwd());
  const watch = process.argv.includes('--watch');

  await compile(name, process.cwd(), watch);
};

module.exports.compile = compile;

// https://nodejs.org/docs/latest/api/modules.html#modules_accessing_the_main_module
if (require.main === module) {
  buildPackageFromCommandLine().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
