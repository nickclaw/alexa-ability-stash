import { UserStore } from './UserStore';
import { MemoryStore } from 'express-session';
import debug from 'debug';
import get from 'lodash/get';
import assert from 'assert';
import { crc32 } from 'crc';

const log = debug('alexa-ability-stash:stashMiddleware');

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

export function createStashMiddleware({
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
    debug('creating stash middleware');
    return function stashMiddleware(req, next) {
        debug('applying middleware');

        // self awareness
        if (req.stash) {
            log('"stash" property already exists');
            return next();
        }

        // make sure store is connected
        if (!storeReady) {
            log('store is disconnected, skipping stash');
            return next();
        }

        // save info about initial stash state
        const originalId = genid(req);
        let originalHash = null;

        // make stash
        req.stashId = originalId;
        req.stash = new Stash(req, store);

        // monkey patch stash.save() in order to update hash
        const _save = req.stash.save;
        Object.defineProperty(req.stash, 'save', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: function save(...args) {
                originalHash = hash(this);
                _save.apply(req.stash, args);
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
                    log('destroying stash');
                    req.stash.destroy(_send);
                    return;
                }

                if (shouldSave(req)) {
                    log('saving stash');
                    req.stash.save(_send);
                    return;
                }

                _send();
            },
        });


        // load the session from streo
        log('reloading stash');
        req.stash.reload(err => {
            if (err) {
                log('error loading session, skipping. %s', err.message);
                return next();
            }

            log('loaded stash');
            originalHash = hash(req.stash);
            next();
        });


        //
        // Misc utility functions
        //

        function shouldDestroy(r) {
            return r.stashId && !r.stash && unset === 'destroy';
        }

        function shouldSave(r) { // eslint-disable-line no-unused-vars
            return r.stashId && r.stash && (    // has stash and stashId and...
                resave ||                       // always saves or..
                r.stashId !== originalId ||     // changed name or..
                originalHash !== hash(r.stash)  // changed value.
            );
        }
    };
}
