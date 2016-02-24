import { MemoryStore, Cookie } from 'express-session';
import { Stash } from '../src/Stash';
import isPlainObject from 'lodash/isPlainObject';

const maxAge = 1000 * 60 * 60;

describe.only('Stash', function() {

    let req = null;
    let store = null;
    let stash = null;
    beforeEach(function() {
        req = {
            stashId: 'foo',
            stash: {}
        };
        store = new MemoryStore();
        store.set('foo', { foo: 'bar', cookie: new Cookie({ maxAge }) });
        stash = new Stash(req, store);
    });

    describe('properties', function() {
        it('should have a "_req" property', function() {
            expect(stash._req).to.equal(req);
        });

        it('should have a "_store" property', function() {
            expect(stash._store).to.equal(store);
        });

        it('should have 0 enumerable keys by default', function() {
            expect(Object.keys(stash)).to.be.empty;
        });
    });

    describe('Stash.prototype.save', function() {
        it('should call "set" on the backing store', function(done) {
            const spy = sinon.spy(store, 'set');
            stash.save(function() {
                expect(spy).to.be.called;
                done();
            });
        });

        it('should chain', function() {
            const result = stash.save(() => null);
            expect(result).to.equal(stash);
        });
    });

    describe('Stash.prototype.reload', function() {
        it('should call "get" on the backing store', function(done) {
            const spy = sinon.spy(store, 'get');
            stash.reload(function() {
                expect(spy).to.be.called;
                done();
            });
        });

        it('should extend itself with the fetched results', function(done) {
            stash.reload(function() {
                expect(stash.foo).to.equal('bar');
                done();
            });
        });

        it('should not extend itself with a "cookie" property', function(done) {
            stash.reload(function() {
                expect(Object.keys(stash)).to.have.lengthOf(1);
                done();
            });
        });

        it('should clear any other properties', function(done) {
            stash.baz = 'bat';
            stash.reload(function() {
                expect(Object.keys(stash)).to.have.lengthOf(1);
                expect(stash.foo).to.equal('bar');
                done();
            });
        });

        it('should chain', function() {
            it('should chain', function() {
                const result = stash.reload(() => null);
                expect(result).to.equal(stash);
            });
        });
    });

    describe('Stash.prototype.destroy', function() {
        it('should call "destroy" on the backing store', function(done) {
            const spy = sinon.spy(store, 'destroy');
            stash.destroy(function() {
                expect(spy).to.be.called;
                done();
            });
        });

        it('should delete "stash" and "stashId" properties from the request object', function(done) {
            expect(req.stash).to.exist;
            expect(req.stashId).to.exist;
            stash.destroy(function() {
                expect(req.stash).to.not.exist;
                expect(req.stashId).to.not.exist;
                done();
            });
        });

        it('should chain', function() {
            it('should chain', function() {
                const result = stash.destroy(() => null);
                expect(result).to.equal(stash);
            });
        });
    });

    describe('Stash.prototype.toJSON', function() {
        it('should return a plain object', function() {
            expect(isPlainObject(stash.toJSON())).to.be.true;
        });

        it('should attach a "cookie" property to the object', function() {
            expect(stash.toJSON()).to.have.keys(['cookie']);
        });
    });
});
