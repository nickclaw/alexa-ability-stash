import noop from 'lodash/noop';
import extend from 'lodash/extend';
import debug from 'debug';
import { Cookie } from 'express-session';

const log = debug('user-store:UserStore');
const TEN_YEARS = 1000 * 60 * 60 * 24 * 365 * 10; // ~10  years, probably long enough

export class UserStore {

    constructor(req, store) {
        log('creating UserStore');
        Object.defineProperty(this, 'req', { value: req });
        Object.defineProperty(this, 'id', { value: req.user.userId });
        Object.defineProperty(this, 'store', { value: store });
    }

    save(fn = noop) {
        log('saving user %s', this.id);
        this.store.set(this.id, this.toJSON(), fn);
        return this;
    }

    reload(fn) {
        log('reloading user %s', this.id);
        this.store.get(this.id, (err, data = {}) => {
            if (err) return fn(err);
            extend(this, data);
            fn();
        });

        return this;
    }

    destroy(fn = noop) {
        log('deleting user %s', this.id);
        delete this.req.userStore;
        this.store.destroy(this.id, fn);
        return this;
    }

    toJSON() {
        const obj = { ...this };
        const cookie = new Cookie({ maxAge: TEN_YEARS });
        // TODO warn about cookie property already existing
        obj.cookie = cookie;
        return obj;
    }
}
