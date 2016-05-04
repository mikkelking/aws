// AWS code
// Module local variables
var serverdata = {};

// Module local variables
Meteor.startup(function () { 
  // Check if AWS configs are present
//    console.log("$HOME="+shell.env['HOME']);
    var awsdir = shell.env['HOME']+"/.aws"
    if (fs.existsSync(awsdir)) {
//     console.log("It looks like the AWS config directory exists already: "+awsdir);
    } else {
      fs.mkdirSync(awsdir);
    }
    if (fs.existsSync(awsdir)) {
	    var awscfg = awsdir+"/config";
	    var awscred = awsdir+"/credentials";
	    if (!fs.existsSync(awscfg) && Meteor.settings.public.awsAccessKeyId) {
	    	var buf = "[default]\n";
	    	buf += "region = ap-southeast-2\n";
			buf += "output = json\n";
			fs.writeFileSync(awscfg,buf);
	    }
	    if (!fs.existsSync(awscred) && Meteor.settings.public.awsAccessKeyId) {
	    	var buf = "[default]\n";
	    	buf += "aws_access_key_id = "+Meteor.settings.public.awsAccessKeyId+"\n";
			buf += "aws_secret_access_key = "+Meteor.settings.public.awsSecretKey+"\n";
			fs.writeFileSync(awscred,buf);
	    } 
    }
RdsDb.remove({});
});


Meteor.methods({


  getAWSRDSDB: function(){
    console.log("Calling AWS RDS");
    var rds = new AWS.RDS({region: "ap-southeast-2"});
    var params = {};
    Meteor.setTimeout(function() { saveRDS(); }, 250);
    rds.describeDBInstances(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
          console.log("Retrieved "+data.DBInstances.length+" RDS db's");           // successful response
          serverdata.rdsdb = data.DBInstances;
        } 
      });
  },
  clrAWSRDSDB: function(){
  	RdsDb.remove({});
  }
});

var saveRDS = function() {
//    console.log("Waiting for RDS data ...");
    if (serverdata.rdsdb){
//        console.log("Boom!");
        myList = serverdata.rdsdb;
        delete serverdata.rdsdb;
//        RdsDb.remove({});
        console.log("Inserting RDS records");
		_.each(myList, function(ds){
      ds.name = ds.DBInstanceIdentifier;
      delete ds.DBInstanceIdentifier;
      ds.status = ds.DBInstanceStatus;
      delete ds.DBInstanceStatus;
			if (RdsDb.find({name: ds.name}).fetch().length === 0) {
				var id = RdsDb.insert(ds);
				console.log("Added RDS '"+ds.name+"' "+id);
			} else {
				console.log("RDS '"+ds.name+"' exists");
			} 
		});
    } else {
    Meteor.setTimeout(function() { saveRDS(); }, 250);
    };
  };

