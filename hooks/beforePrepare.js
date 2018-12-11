const exec = require('child_process').exec;

module.exports = function(ctx) {
  return new Promise((resolve, reject) => {
    exec(
      'ionic --version --no-interactive',
      { cwd: ctx.opts.projectRoot },
      ionicVersionOutput.bind({}, ctx.opts.projectRoot, resolve, reject)
    )
  });
};

function ionicVersionOutput(rootDir, resolve, reject, err, version, stderr) {
  if(err) {
    console.error('There was an error checking your version of the Ionic CLI are you sure you have it installed?');
    console.log(err);
    console.log(stderr);
    reject();
  }
  const versionInfo = version.split('.');
  let majorVersion = undefined;
  while (versionInfo.length && isNaN(majorVersion)) {
    majorVersion = versionInfo.shift();
  }
  if (isNaN(majorVersion)) {
    console.error('There was an error checking your version of the Ionic CLI are you sure you have it installed?');
    reject();
  }
  else if (majorVersion < 4) {
    console.error(`You are running version ${majorVersion} of the Ionic CLI. Version 4 or greater is required for this plugin.`);
    reject();
  }

  console.log('Generating initial manifest for Ionic Deploy...');
  exec(
    'ionic deploy manifest --no-interactive',
    { cwd: rootDir },
    ionicManifestOutput.bind({}, resolve, reject)
  )
}

function ionicManifestOutput(resolve, reject, err, version, stderr) {
  if(err) {
    console.error('There was an error generating the initial manifest of files for the deploy plugin.');
    reject()
  }
  resolve();
  console.log('Ionic Deploy initial manifest successfully generated.');
}
