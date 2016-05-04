// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// S T A R T U P  Function
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Meteor.startup(function () { 

  Meteor.publish("rdsdb", function () {
      return RdsDb.find();
  });

});

var outputName;

Meteor.methods({



});

   
