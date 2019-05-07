---
previousText: 'Channels'
previousUrl: '/docs/appflow/deploy/channels'
nextText: 'Tutorials and Videos'
nextUrl: '/docs/appflow/deploy/tutorials'
---

## Installation and Usage

In order to use the Deploy API inside of your app. You simply need to install the latest version of the Appflow
SDK and set the `UPDATE_METHOD` to `none`:

<command-line>
<command-prompt>
ionic cordova plugin add cordova-plugin-ionic --variable UPDATE_METHOD="none" --variable APP_ID="YOUR_APP_ID" --variable CHANNEL_NAME="YOUR_CHANNEL_NAME"
</command-prompt>
</command-line>

Then you can import the Deploy API in order to it in your code:
```typescript
import { Deploy } from 'cordova-plugin-ionic';

...


async changeToBetaChannel() {
  await Deploy.configure({channel: 'BETA'});
}

...

```
