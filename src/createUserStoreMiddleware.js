import { UserStore } from './UserStore';
import { MemoryStore } from 'express-session';
import debug from 'debug';
import get from 'lodash/get';
import assert from 'assert';
import { crc32 } from 'crc';

const log = debug('user-store:storeMiddleware');

function generateSessionId(req) {
    const appId = get(req, 'raw.session.application.applicationId');
    const userId = get(req, 'raw.session.user.userId');
    return `${appId}:${userId}`;
}

// from express-session
function hash(sess) {
    return crc32(JSON.stringify(sess, (key, val) => {
        if (key !== 'cookie') {
            return val;
        }
    }));
}

export function createUserStoreMiddleware({
    store = new MemoryStore(),
    resave = true,
    genid = generateSessionId,
    unset = 'keep',
} = {}) {
    // validate options
    // TODO validate store?
    assert(typeof generateSessionId === 'function', 'genid option must be a function');
    assert(unset === 'keep' || unset === 'destroy', 'unset option must be "destroy" or "keep"');

    // track ready state
    let storeReady = true;
    store.on('disconnect', () => log('store disconnected'), storeReady = false);
    store.on('connect', () => log('store connected'), storeReady = true);

    // return alexa-ability middleware
    debug('creating store middleware');
    return function storeMiddleware(req, next) {
        debug('applying middleware');

        // self awareness
        if (req.store) {
            log('"store" property already exists');
            return next();
        }

        // make sure store is connected
        if (!storeReady) {
            log('store is disconnected');
            return next();
        }

        // Handle connection as if there is no session if
        // the store has temporarily disconnected etc
        if (!storeReady) {
            log('store is not ready, skipping');
            return next();
        }

        // store info about initial store state
        const originalId = genid(req);
        let originalHash = null;

        // make store
        req.storeId = originalId;
        req.store = new UserStore(req, store);

        // monkey patch store.save in order to update hash
        const _save = req.store.save;
        Object.defineProperty(req.store, 'save', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: function save(...args) {
                originalHash = hash(this);
                _save.apply(req.store, args);
            },
        });

        // monkey patch req.send() in order to save final session
        const _send = req.send.bind(req);
        Object.defineProperty(req, 'send', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: function send() {
                if (shouldDestroy(req)) {
                    log('destroying store');
                    req.store.destroy(_send);
                    return;
                }

                if (shouldSave(req)) {
                    log('saving store');
                    req.store.save(_send);
                    return;
                }

                _send();
            },
        });


        // load the session from streo
        log('reloading store');
        req.store.reload(err => {
            if (err) {
                log('error loading session, skipping. %s', err.message);
                return next();
            }

            log('loaded store');
            originalHash = hash(req.store);
            next();
        });


        //
        // Misc utility functions
        //

        function shouldDestroy(r) {
            return r.storeId && !r.store && unset === 'destroy';
        }

        function shouldSave(r) { // eslint-disable-line no-unused-vars
            return r.storeId && r.store && (    // has store and storeId and...
                resave ||                       // always saves or..
                r.storeId !== originalId ||     // changed name or..
                originalHash !== hash(r.store)  // changed value.
            );
        }
    };
}
