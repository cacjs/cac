require('ts-node/register')
const cli = require('../src/index').cac()

const command = cli
  .command("", "Do something")
  .alias("something")
  .action(async () => {
    console.log("Did something!");
  });

cli.parse()
