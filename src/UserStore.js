import noop from 'lodash/noop';
import extend from 'lodash/extend';
import omit from 'lodash/omit';
import debug from 'debug';
import { Cookie } from 'express-session';

const log = debug('user-store:UserStore');
const TEN_YEARS = 1000 * 60 * 60 * 24 * 365 * 10; // ~10  years, probably long enough

export class UserStore {

    constructor(req, store) {
        log('creating store');
        Object.defineProperty(this, '_req', { value: req });
        Object.defineProperty(this, '_store', { value: store }); // TODO put on request?
    }

    save(fn = noop) {
        log('saving user %s', this._req.storeId);
        console.log(this.toJSON());
        this._store.set(this._req.storeId, this.toJSON(), fn);
        return this;
    }

    reload(fn = noop) {
        log('reloading user %s', this._req.storeId);
        this._store.get(this._req.storeId, (err, data = {}) => {
            if (err) return fn(err);
            extend(this, omit(data, 'cookie'));
            fn();
        });

        return this;
    }

    destroy(fn = noop) {
        log('deleting user %s', this._req.storeId);
        delete this._req.store;
        delete this._req.storeId;
        this._store.destroy(this._req.storeId, fn);
        return this;
    }

    toJSON() {
        const obj = { ...this };
        const cookie = new Cookie({ maxAge: TEN_YEARS });
        // TODO warn about cookie property already existing?
        obj.cookie = cookie;
        return obj;
    }
}
