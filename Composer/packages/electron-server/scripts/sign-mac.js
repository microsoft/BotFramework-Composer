// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs');
const path = require('path');
// eslint-disable-next-line security/detect-child-process
const { execSync } = require('child_process');

const glob = require('globby');

const { log } = require('./common');

if (process.platform !== 'darwin') {
  log.error('Script can only be run on MacOS');
  process.exit(1);
}

const provisionProfilePath = process.argv[2];

if (!provisionProfilePath || !fs.existsSync(provisionProfilePath)) {
  log.error('Unable to locate provision profile: %s', provisionProfilePath);
  process.exit(1);
}

if (!process.env.DEV_CERT_ID || !process.env.DEV_CERT || !process.env.DEV_CERT_PASSWORD) {
  log.error('Dev certificate not found.');
  process.exit(1);
}

const tempDir = process.env.AGENT_TEMPDIRECTORY;
if (!tempDir) {
  log.error('No temp dir set. (AGENT_TEMPDIRECTORY)');
  process.exit(1);
}

// sign each app bundle with correct entitlements
const baseBundlePath = path.resolve(__dirname, '../dist/mac/Bot Framework Composer.app');
const baseEntitlementsPath = path.resolve(__dirname, '../resources/entitlements.plist');
const keychainEntitlementsPath = path.resolve(__dirname, '../resources/entitlements-keychain.plist');

const bundles = [
  {
    path: path.join(baseBundlePath, 'Contents/Frameworks/Bot Framework Composer Helper (GPU).app'),
    entitlements: baseEntitlementsPath,
  },
  {
    path: path.join(baseBundlePath, 'Contents/Frameworks/Bot Framework Composer Helper (Plugin).app'),
    entitlements: baseEntitlementsPath,
  },
  {
    path: path.join(baseBundlePath, 'Contents/Frameworks/Bot Framework Composer Helper (Renderer).app'),
    entitlements: baseEntitlementsPath,
  },
  {
    path: path.join(baseBundlePath, 'Contents/Frameworks/Bot Framework Composer Helper.app'),
    entitlements: keychainEntitlementsPath,
  },
  {
    path: baseBundlePath,
    entitlements: keychainEntitlementsPath,
  },
];

// first copy the provision profile into each app bundle
try {
  for (const bundle of bundles) {
    fs.copyFileSync(provisionProfilePath, path.join(bundle.path, 'Contents/embedded.provisionprofile'));
  }
} catch (err) {
  log.error('Error copying provision profile. %O', err);
  process.exit(1);
}

// second step is to setup a dev cert to use to sign
try {
  log.info('-------- Setting up keychain. --------\n');
  const keychainPath = `${tempDir}/buildagent.keychain`;
  const certPath = `${tempDir}/cert.p12`;

  log.info(`security create-keychain -p pwd ${keychainPath}`);
  execSync(`security create-keychain -p pwd ${keychainPath}`, { stdio: 'inherit' });

  log.info(`security default-keychain -s ${keychainPath}`);
  execSync(`security default-keychain -s ${keychainPath}`, { stdio: 'inherit' });

  log.info(`security unlock-keychain -p pwd ${keychainPath}`);
  execSync(`security unlock-keychain -p pwd ${keychainPath}`, { stdio: 'inherit' });

  log.info(`echo ********* | base64 -D > ${certPath}`);
  execSync(`echo "$DEV_CERT" | base64 -D > ${certPath}`, { stdio: 'inherit' });

  log.info(`security import ${certPath} -k ${keychainPath} -P "*********" -T /usr/bin/codesign`);
  execSync(`security import ${certPath} -k ${keychainPath} -P "$DEV_CERT_PASSWORD" -T /usr/bin/codesign`, {
    stdio: 'inherit',
  });

  log.info(`security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k pwd ${keychainPath}`);
  execSync(`security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k pwd ${keychainPath}`, {
    stdio: 'inherit',
  });
} catch (err) {
  log.error('Error setting up dev certificate and keychain. %O', err);
  process.exit(1);
}

try {
  log.info('-------- Signing frameworks. --------\n');
  const fwsPath = path.join(baseBundlePath, 'Contents/Frameworks');
  const frameworks = glob.sync('*.framework', { cwd: fwsPath, onlyFiles: false });

  for (const fw of frameworks) {
    const fwPath = path.join(baseBundlePath, 'Contents/Frameworks', fw, 'Versions/A');
    const dylibs = glob.sync('Libraries/*.dylib', { cwd: fwPath });

    for (const lib of dylibs) {
      log.info(`codesign -s ******* --timestamp=none --force "${path.join(fwPath, lib)}"`);
      execSync(`codesign -s $DEV_CERT_ID --timestamp=none --force "${path.join(fwPath, lib)}"`, {
        stdio: 'inherit',
      });
    }

    log.info(`codesign -s ******* --timestamp=none --force "${fwPath}"`);
    execSync(`codesign -s $DEV_CERT_ID --timestamp=none --force "${fwPath}"`, {
      stdio: 'inherit',
    });
  }
} catch (err) {
  log.error('Error signing frameworks. %O', err);
  process.exit(1);
}

try {
  log.info('-------- Signing bundles. --------\n');
  for (const bundle of bundles) {
    log.info(
      `codesign -s ******* --timestamp=none --force --options runtime --entitlements "${bundle.entitlements}" "${bundle.path}"`
    );
    execSync(
      `codesign -s $DEV_CERT_ID --timestamp=none --force --options runtime --entitlements "${bundle.entitlements}" "${bundle.path}"`,
      { stdio: 'inherit' }
    );
  }
} catch (err) {
  log.error('Error setting signing app bundles. %O', err);
  process.exit(1);
}

// verify codesign
try {
  log.info('-------- Verifying codesigning. --------\n');
  for (const bundle of bundles) {
    log.info(`codesign -dv --verbose=4 "${bundle.path}"`);
    execSync(`codesign -dv --verbose=4 "${bundle.path}"`);
  }
} catch (err) {
  log.error('Error verifying codesign. %O', err);
  process.exit(1);
}
