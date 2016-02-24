import { Ability } from 'alexa-ability';
import { createStashMiddleware } from '../src/createStashMiddleware';
import { Stash } from '../src/Stash';
import { MemoryStore, Cookie } from 'express-session';
import intentRequest from './fixtures/intent-request';

const id = `${intentRequest.session.application.applicationId}:${intentRequest.session.user.userId}`;
const maxAge = 1000 * 60 * 60;

describe('createStash', function() {

    let app = null;
    beforeEach(function() {
        app = new Ability({ applicationId: intentRequest.session.application.applicationId });
    });

    it('should return a middleware function', function() {
        const middleware = createStashMiddleware();
        expect(middleware).to.be.instanceOf(Function);
        expect(middleware.length).to.equal(2);
    });

    describe('middleware function', function() {
        describe('request properties', function() {

            beforeEach(function() {
                const store = new MemoryStore();
                app.use(createStashMiddleware({ store }))
            });

            it('should set a "stash" property on the request', function(done) {
                const req = app.handle(intentRequest, (err, req) => {
                    expect(req.stash).to.exist;
                    expect(req.stash).to.be.instanceOf(Stash);
                    done();
                });
            });

            it('should set a "stashId" property on the request', function(done) {
                const req = app.handle(intentRequest, (err, req) => {
                    expect(req.stashId).to.exist;
                    done();
                });
            });
        });

        describe('"unset" option', function() {
            it('should throw if not a valid option', function() {
                const store = new MemoryStore();
                expect(() => app.use(createStashMiddleware({ store, unset: 'foo' }))).to.throw;
            });

            it('should honor "destroy"', function(done) {
                const store = new MemoryStore();
                store.set(id, { foo: 'bar', cookie: new Cookie({maxAge}) });

                app.use(createStashMiddleware({ store, unset: 'destroy' }));
                app.on('GetZodiacHoroscopeIntent', function test(req, next) {
                    delete req.stash;
                    req.end();
                });

                app.handle(intentRequest, function(err, req) {
                    expect(err).to.be.null;
                    expect(req.stash).to.be.undefined;
                    expect(store.sessions[id]).to.be.undefined;
                    done();
                });
            });

            it('should honor "keep"', function(done) {
                const store = new MemoryStore();
                store.set(id, { foo: 'bar', cookie: new Cookie({maxAge}) });

                app.use(createStashMiddleware({ store, unset: 'keep' }));
                app.on('GetZodiacHoroscopeIntent', function(req, next) {
                    delete req.stash;
                    req.end();
                });

                app.handle(intentRequest, function(err, req) {
                    expect(err).to.be.null;
                    expect(req.stash).to.be.undefined;
                    expect(store.sessions[id]).to.exist;
                    done();
                });
            });
        });

        describe('"genid" option', function() {
            it('should default to default genid function', function(done) {
                const store = new MemoryStore();
                app.use(createStashMiddleware({ store }));
                app.handle(intentRequest, function(err, req) {
                    expect(req.stashId).to.equal(id);
                    done();
                });
            });

            it('should honor the passed function', function(done) {
                const store = new MemoryStore();
                const spy = sinon.spy(() => 'foo');

                app.use(createStashMiddleware({ store, genid: spy }));
                app.handle(intentRequest, function(err, req) {
                    expect(spy).to.be.calledWith(req);
                    expect(req.stashId).to.equal('foo');
                    done();
                });
            });
        });

        describe('"resave" option', function() {
            it('should always resave when true', function(done) {
                const store = new MemoryStore();
                store.set(id, { foo: 'bar', cookie: new Cookie({ maxAge }) })
                const spy = sinon.spy(store, 'set');

                app.use(createStashMiddleware({ store, resave: true }));
                app.on('GetZodiacHoroscopeIntent', (req, next) => req.send());
                app.handle(intentRequest, function(err, req) {
                    expect(spy).to.be.called;
                    done();
                });
            });

            it('should not resave stash when false', function() {
                const store = new MemoryStore();
                store.set(id, { foo: 'bar', cookie: new Cookie({ maxAge }) })
                const spy = sinon.spy(store, 'set');

                app.use(createStashMiddleware({ store, resave: false }));
                app.on('GetZodiacHoroscopeIntent', (req, next) => req.send());
                app.handle(intentRequest, function(err, req) {
                    expect(spy).to.be.not.called;
                    done();
                });
            });

            it('should save the stash if it is modified', function() {
                const store = new MemoryStore();
                store.set(id, { foo: 'bar', cookie: new Cookie({ maxAge }) })
                const spy = sinon.spy(store, 'set');

                app.use(createStashMiddleware({ store, resave: false }));
                app.on('GetZodiacHoroscopeIntent', (req, next) => req.stash = 'bat' && req.send());
                app.handle(intentRequest, function(err, req) {
                    expect(spy).to.be.called;
                    expect(store.sessions[id]).to.equal('bat');
                    done();
                });
            });
        });

        describe('store disconnect behavior', function() {
            it('should skip getting the stash when disconnected', function() {
                const store = new MemoryStore();
                app.use(createStashMiddleware({ store }));
                store.emit('disconnected');

                app.use(req => req.end());
                app.handle(function(err, req) {
                    expect(err).to.equal(null);
                    expect(req.stash).to.be.undefined;
                    expect(req.stashId).to.be.undefined;
                });
            });
        });
    });
});
