---
home: true
features:
- title: Simple yet Powerful
  details: CAC is all you need to create a powerful CLI application while there're not many things to learn!
- title: Minimalistic and Fast
  details: No big dependencies, auto-generated documentation, blazing-fast!
- title: Actively Maintained
  details: Written in TypeScript and maintained by the community and me.
actionText: Getting Started
actionLink: /guide/getting-started
footer: MIT Licensed | Copyright © 2016-present EGOIST
---

## Hello World

📝 __cli.js__:

```js
const cac = require('cac')

const cli = cac()

const { input, flags } = cli.parse()

console.log(input, flags)
```
