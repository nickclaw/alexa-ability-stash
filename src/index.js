import { createStashMiddleware as createStash } from './createStashMiddleware';
import { Stash } from './Stash';
import { Store } from 'express-session';

// similar profile as express-session
createStash.Store = Store;
createStash.Stash = Stash;
export default createStash;
