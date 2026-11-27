module.exports = {
  apps: [
    {
      name: 'quiztuhoc-backend',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '350M',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      time: true,
    },
  ],
};
