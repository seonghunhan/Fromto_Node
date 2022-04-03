//코드4. 설정파일 ecosystem.config.js
//ecosystem.config.js
module.exports = {
    apps: [{
    name: 'index',
    script: './index.js',
    instances: 0,
    exec_mode: 'cluster',
    wait_ready: true,
    listen_timeout: 50000,
    kill_timeout: 5000
    }]
  }