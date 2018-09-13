const { carnesenDotCom, runAndExit } = require('..');

runAndExit(async () => {
  await carnesenDotCom.create();
});
