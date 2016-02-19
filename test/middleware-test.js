import { createUserStoreMiddleware } from '../src/createUserStoreMiddleware';
import { UserStore } from '../src/UserStore';
import { Ability } from 'alexa-ability';
import { MemoryStore } from 'express-session';

const intentRequest = require('./fixtures/intent-request');

function genid(req) {
    return 'foo';
}

describe('middleware behavior', function() {

    let app = null;
    let store = null;

    beforeEach(function() {
        store = new MemoryStore();
        app = new Ability({ store, genid });
    });

    it('should create a "store" property', function(done) {
        const handler = sinon.spy(function(req, next) {
            expect(req.store).to.exist;
            expect(req.store).to.be.instanceOf(UserStore);
            req.send();
        });

        app.use(createUserStoreMiddleware());
        app.on('GetZodiacHoroscopeIntent', handler);

        app.handle(intentRequest, function(err, req) {
            expect(handler).to.have.been.called;
            done(err);
        });
    });

    it('should persist data on the "store" property', function(done) {
        const handlerA = sinon.spy(function(req, next) {
            req.store.a = 1;
            req.send();
        });

        const handlerB = sinon.spy(function(req, next) {
            expect(req.store.a).to.equal(1);
            req.send();
        });

        app.use(createUserStoreMiddleware());
        app.on('GetZodiacHoroscopeIntent', handlerA);

        app.handle(intentRequest, function(err) {
            if (err) return done(err);
            expect(handlerA).to.have.been.called;

            delete app._handlers['GetZodiacHoroscopeIntent'];
            app.on('GetZodiacHoroscopeIntent', handlerB);
            app.handle(intentRequest, function(err) {
                expect(handlerB).to.have.been.called;
                done();
            });
        });
    });

    describe.only('destroying "store"', function() {

        beforeEach(function() {
            store.sessions['foo'] = { foo: 'bar' };
            app.use(createUserStoreMiddleware());
        });

        it('should be possible by unsetting it', function(done) {
            app.use((req, next) => {
                delete req.store;
                next();
            });
            app.on('GetZodiacHoroscopeIntent', function(req) {
                expect(req.store.foo).to.equal('bar');
                req.send();
            });

            app.handle(intentRequest, function() {
                expect(store.session.foo).to.equal(undefined);
                done();
            });
        });

        it('should be possible by destroying it', function(done) {
            app.use((req, next) => req.store.destroy(next));
            app.on('GetZodiacHoroscopeIntent', function(req) {
                expect(req.store.foo).to.equal('bar');
                req.send();
            });

            app.handle(intentRequest, function() {
                expect(store.session.foo).to.equal(undefined);
                done();
            });
        });
    });
});
