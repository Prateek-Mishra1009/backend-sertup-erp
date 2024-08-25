const { spawn } = require('child_process');

const runChildProcess = () => {
  const childProcess = spawn('ls', ['-lh']);

  childProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  childProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  childProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

runChildProcess();
