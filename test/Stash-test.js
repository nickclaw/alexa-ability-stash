

describe('Stash', function() {

    describe('properties', function() {
        it('should have a "_req" property', function() {

        });

        it('should have a "_store" property', function() {

        });

        it('should have 0 enumerable keys by default', function() {

        });
    });

    describe('Stash.prototype.save', function() {
        it('should call "set" on the backing store', function() {

        });

        it('should chain', function() {

        });
    });

    describe('Stash.prototype.reload', function() {
        it('should call "get" on the backing store', function() {

        });

        it('should extend itself with the fetched results', function() {

        });

        it('should not extend itself with a "cookie" property', function() {

        });

        it('should clear any other properties', function() {

        });

        it('should chain', function() {

        });
    });

    describe('Stash.prototype.destroy', function() {
        it('should call "destroy" on the backing store', function() {

        });

        it('should delete "stash" and "stashId" properties from the request object', function() {

        });

        it('should chain', function() {

        });
    });

    describe('Stash.prototype.toJSON', function() {
        it('should return a plain object', function() {
            // TODO make sure plain!
        });

        it('should attach a "cookie" property to the object', function() {

        });
    });
});
