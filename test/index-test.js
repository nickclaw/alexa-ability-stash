import test from '../src/';
import { createStashMiddleware } from '../src/createStashMiddleware';
import { Store } from 'express-session';
import { Stash } from '../src/Stash';

describe('main file', function() {

    it('should be the "createStash" function', function() {
        expect(test).to.equal(createStashMiddleware);
    });

    it('should have "Stash" attached', function() {
        expect(test.Stash).to.exist;
        expect(test.Stash).to.equal(Stash);
    });

    it('should have express-session "Store" attached', function() {
        expect(test.Store).to.exist;
        expect(test.Store).to.equal(Store);
    });
});
