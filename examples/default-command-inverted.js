require('ts-node/register')
const cli = require('../src/index').cac()

const command = cli
  .command("something", "Do something")
  .alias("!")
  .action(async () => {
    console.log("Did something!");
  });

cli.parse()
