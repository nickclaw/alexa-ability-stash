import { UserStore } from './UserStore';
import { MemoryStore } from 'express-session';
import debug from 'debug';

const log = debug('user-store:userStoreMiddleware');

export function createUserStoreMiddleware({
    store = new MemoryStore(),
} = {}) {
    // track ready state
    let storeReady = true;
    store.on('disconnect', () => log('store disconnected'), storeReady = false);
    store.on('connect', () => log('store connected'), storeReady = true);

    debug('creating store middleware');
    return function userStoreMiddleware(req, next) {
        debug('applying middleware');

        // self awareness
        if (req.userStore) {
            log('userStore property already exists');
            return next();
        }

        // Handle connection as if there is no session if
        // the store has temporarily disconnected etc
        if (!storeReady) {
            log('store is not ready, skipping');
            return next();
        }

        const userStore = new UserStore(req, store);

        // monkey patch userStore.save
        const _save = userStore.save.bind(userStore);
        userStore.save = function save(fn) {
            // TODO save hash
            _save(fn);
        };

        // monkey patch req.send()
        const _send = req.send.bind(req);
        req.send = function send() {
            log('checking userStore');

            if (shouldDestroy(req)) {
                log('destroying userStore');
                userStore.destroy(_send);
                return;
            }

            if (shouldSave(req)) {
                log('saving userStore');
                userStore.save(_send);
                return;
            }

            log('not updating userStore');
            _send();
        };

        // load the session
        log('reloading userStore');
        userStore.reload(err => {
            if (err) {
                log('error loading session, skipping. %s', err.message);
                return next();
            }

            log('loaded userStore');
            req.userStore = userStore;
            next();
        });


        //
        // Misc utility functions
        //

        function shouldDestroy(r) {
            return !r.userStore;
        }

        function shouldSave(r) { // eslint-disable-line no-unused-vars
            return true; // TODO compare hash
        }
    };
}
