import { createUserStoreMiddleware as userStore } from './createUserStoreMiddleware';
import { UserStore } from './UserStore';
import { Store } from 'express-session';

// similar profile as express-session
userStore.Store = Store;
userStore.UserStore = UserStore;
export default userStore;
