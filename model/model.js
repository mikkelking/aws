// Collections that exist on the server database
RdsDb = new Mongo.Collection("rdsdb");

Meteor.users.allow({
    remove: function () {
        return true; 
    }
});
