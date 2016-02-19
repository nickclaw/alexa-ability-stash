import { createUserStoreMiddleware as store } from './createUserStoreMiddleware';
import { UserStore } from './UserStore';
import { Store } from 'express-session';

// similar profile as express-session
store.store = store;
store.Store = Store;
store.UserStore = UserStore;
export default store;
