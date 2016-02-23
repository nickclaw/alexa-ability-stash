alexa-ability-stash [![Build Status](https://travis-ci.org/nickclaw/alexa-ability-stash.svg?branch=master)](https://travis-ci.org/nickclaw/alexa-ability-stash)
------------------------
An alexa-ability middleware for persistent user storage.

> Warning: Still in development. Not suitable for use in production yet.

### Example

```js
import { Ability } from 'alexa-ability';
import { handleAbility } from 'alexa-ability-lambda-handler';
import createStash from 'alexa-ability-stash';
import createRedisStore from 'connect-redis'; // or any compatible express-session store

const RedisStore = createRedisStore(createStash);
const store = new RedisStore(options);
const app = new Ability();

app.use(createStash({ store }));

app.on('LuckyNumberIntent', function(req, next) {
    if (!req.stash.luckyNumber) {
        // persisted "forever"
        req.stash.luckyNumber = Math.floor(Math.random() * 100 + 1);
    }

    req.say(`Your lucky number is ${req.stash.luckyNumber}!`).end();
});

export const handler = handleAbility(app);
```

### API

##### `createStash(options) -> middleware`
Creates a middleware function to handle the stash.

Takes the following options:
 - `store`
 - `genid`
 - `unset`
 - `resave`

Attaches two properties to the request object:
 - `stash`
 - `stashId`
