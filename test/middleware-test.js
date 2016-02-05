import { createUserStoreMiddleware } from '../src/createUserStoreMiddleware';
import { UserStore } from '../src/UserStore';
import { Ability } from 'alexa-ability';

const intentRequest = require('./fixtures/intent-request');

describe('middleware behavior', function() {

    let app = null;

    beforeEach(function() {
        app = new Ability();
    });

    it('should create a "userStore" property', function(done) {
        const handler = sinon.spy(function(req, next) {
            expect(req.userStore).to.exist;
            expect(req.userStore).to.be.instanceOf(UserStore);
            req.send();
        });

        app.use(createUserStoreMiddleware());
        app.on('GetZodiacHoroscopeIntent', handler);

        app.handle(intentRequest, function(err, req) {
            expect(handler).to.have.been.called;
            done(err);
        });
    });

    it('should persist data on the "userStore" property', function(done) {
        const handlerA = sinon.spy(function(req, next) {
            req.userStore.a = 1;
            req.send();
        });

        const handlerB = sinon.spy(function(req, next) {
            expect(req.userStore.a).to.equal(1);
            req.send();
        });

        app.use(createUserStoreMiddleware());
        app.on('GetZodiacHoroscopeIntent', handlerA);

        app.handle(intentRequest, function(err) {
            if (err) return done(err);
            expect(handlerA).to.have.been.called;

            app.on('GetZodiacHoroscopeIntent', handlerB);
            app.handle(intentRequest, function(err) {
                expect(handlerB).to.have.been.called;
                done();
            });
        });
    });

    describe('destroying "userStore"', function() {

        beforeEach(function(done) {
            app.use(createUserStoreMiddleware());
            app.on('GetZodiacHoroscopeIntent', function(req) {
                req.userStore.foo = "bar";
                req.send();
            });
            app.handle(intentRequest, done);
        });

        it('should be possible by unsetting it', function(done) {
            app.on('GetZodiacHoroscopeIntent', function(req) {
                expect(req.userStore.foo).to.equal("bar");
                req.userStore = null;
                req.send();
            });
            app.handle(intentRequest, function(err) {
                if (err) return done(err);
                app.on('GetZodiacHoroscopeIntent', function(req) {
                    expect(req.userStore.foo).to.be.undefined;
                    req.send();
                });
                app.handle(intentRequest, done);
            });
        });

        it('should be possible by destroying it', function(done) {
            app.on('GetZodiacHoroscopeIntent', function(req) {
                expect(req.userStore.foo).to.equal("bar");
                req.userStore.destroy(req.send);
            });
            app.handle(intentRequest, function(err) {
                if (err) return done(err);
                app.on('GetZodiacHoroscopeIntent', function(req) {
                    expect(req.userStore.foo).to.be.undefined;
                    req.send();
                });
                app.handle(intentRequest, done);
            });
        });
    });
});
