const exec = require('child_process').exec;

module.exports = function(ctx) {
  exec(
    'ionic --version --no-interactive',
    { cwd: ctx.opts.projectRoot },
    ionicVersionOutput.bind({}, ctx.opts.projectRoot)
  )
};

function ionicVersionOutput(rootDir, err, version, stderr) {
  if(err) {
    console.error('There was an error checking your version of the Ionic CLI are you sure you have it installed?');
    console.log(err);
    console.log(stderr);
    process.exit(-1);
  }
  const versionInfo = version.split('.');
  let majorVersion = undefined;
  while (versionInfo.length && isNaN(majorVersion)) {
    majorVersion = versionInfo.shift();
  }
  if (isNaN(majorVersion)) {
    console.error('There was an error checking your version of the Ionic CLI are you sure you have it installed?');
    process.exit(-1);
  }
  else if (majorVersion < 4) {
    console.error(`You are running version ${majorVersion} of the Ionic CLI. Version 4 or greater is required for this plugin.`);
    process.exit(-1);
  }

  console.log('Generating intial manifest for Ionic Deploy...');
  exec(
    'ionic deploy manifest --no-interactive',
    { cwd: rootDir },
    ionicManifestOutput
  )
}

function ionicManifestOutput(err, version, stderr) {
  if(err) {
    console.error('There was an error generating the intial manifest of files for the deploy plugin.');
    process.exit(-1);
  }
  console.log('Ionic Deploy initial manifest successfully generated.');
}
