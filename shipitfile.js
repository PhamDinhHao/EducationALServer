module.exports = function (shipit) {
  require('shipit-deploy')(shipit)

  shipit.initConfig({
    default: {
      workspace: './dist',
      keepWorkspace: false,
      deployTo: '/var/www/cms-add/dist',
      repositoryUrl: '',
      branch: 'main',
      ignores: ['.git', 'node_modules', '.env'],
      keepReleases: 2,
      shallowClone: false
    },
    production: {
      servers: 'root@147.79.118.2:22'
    }
  })

  shipit.task('deploy', async () => {
    await shipit.local(`scp -r ${shipit.config.workspace}/* root@147.79.118.2:${shipit.config.deployTo}/`)

    // Build the project on the server
    await shipit.remote(`cd ${shipit.config.deployTo} && pm2 restart cms-add`)
  })
}
