import noop from 'lodash/noop';
import extend from 'lodash/extend';
import omit from 'lodash/omit';
import debug from 'debug';
import { Cookie } from 'express-session';

const log = debug('alexa-ability-stash:Stash');
const TEN_YEARS = 1000 * 60 * 60 * 24 * 365 * 10; // ~10  years, probably long enough

export class Stash {

    constructor(req, store) {
        log('creating stash');
        Object.defineProperty(this, '_req', { value: req });
        Object.defineProperty(this, '_store', { value: store }); // TODO put on request?
    }

    save(fn = noop) {
        log('saving user %s', this._req.stashId);
        this._store.set(this._req.stashId, this.toJSON(), fn);
        return this;
    }

    reload(fn = noop) {
        log('reloading user %s', this._req.stashId);
        this._store.get(this._req.stashId, (err, data = {}) => {
            if (err) return fn(err);
            extend(this, omit(data, 'cookie'));
            fn();
        });

        return this;
    }

    destroy(fn = noop) {
        log('deleting user %s', this._req.stashId);
        delete this._req.stash;
        delete this._req.stashId;
        this._store.destroy(this._req.stashId, fn);
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
