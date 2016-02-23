import { Ability } from 'alexa-ability';
import { createUserStoreMiddleware } from '../src/createUserStoreMiddleware';
import intentRequest from './fixtures/intent-request';

describe('createUserStore', function() {

    let app = null;
    beforeEach(function() {
        app = new Ability({ applicationId: intentRequest.session.application.applicationId });
    });

    it('should return a middleware function', function() {
        const middleware = createUserStoreMiddleware();
        expect(middleware).to.be.instanceOf(Function);
        expect(middleware.length).to.equal(2);
    });

    describe('middleware function', function() {

        describe('request properties', function() {
            it('should set a "store" property on the request', function() {

            });

            it('should set a "storeId" property on the request', function() {

            });
        });

        describe('"unset" option', function() {
            it('should throw if not a valid option', function() {

            });

            it('should honor "destroy"', function() {

            });

            it('should honor "keep"', function() {

            });
        });

        describe('"genid" option', function() {
            it('should default to default genid function', function() {

            });

            it('should honor the passed function', function() {

            });
        });

        describe('"resave" option', function() {
            it('should default to true', function() {

            });

            it('should resave when true', function() {

            });

            it('should not resave store when false', function() {

            });
        });

        describe('store disconnect behavior', function() {
            it('should skip getting the store when disconnected', function() {

            });

            it('should get the store when connected', function() {

            });
        });
    });
});
