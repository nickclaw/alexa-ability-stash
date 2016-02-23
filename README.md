alexa-ability-user-store [![Build Status](https://travis-ci.org/nickclaw/alexa-ability-user-store.svg?branch=master)](https://travis-ci.org/nickclaw/alexa-ability-user-store)
------------------------
An alexa-ability middleware for persistent user stores.

> Warning: Still in development. Not suitable for use in production yet.

### Example

```js
import { Ability } from 'alexa-ability';
import { handleAbility } from 'alexa-ability-lambda-handler';
import userStore from 'alexa-ability-user-store';
import createRedisStore from 'connect-redis'; // or any compatible express-session store

const RedisStore = createRedisStore(userStore);
const store = new RedisStore(options);
const app = new Ability();

app.use(userStore({ store }));

app.on('LuckyNumberIntent', function(req, next) {
    if (!req.userStore.luckyNumber) {
        // persisted "forever"
        req.userStore.luckyNumber = Math.floor(Math.random() * 100 + 1);
    }

    req.say(`Your lucky number is ${req.userStore.luckyNumber}!`).end();
});

export const handler = handleAbility(app);
```

### Stores

TBD
