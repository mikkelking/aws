//import {AWS} from 'AWS';
angular.module('sentriumApp').controller('awsController', 
  ["$scope", "$location", "$rootScope" , "$timeout",  'uiGridConstants', 
    function ($scope, $location, $rootScope, $timeout, uiGridConstants,) {

  $scope.treeOptions = {
      nodeChildren: "children",
      dirSelectable: true,
      injectClasses: {
          ul: "a1",
          li: "a2",
          liSelected: "a7",
          iExpanded: "a3",
          iCollapsed: "a4",
          iLeaf: "a5",
          label: "a6",
          labelSelected: "a8"
      }
  }
  $scope.awsData = [];

    var dbData = [];
    $scope.rdsChange = 0;
    $scope.columns = [{ field: 'RegionName' }];
    $scope.regionOptions = {
      enableSorting: true,
//      multiSelect: true,
      enableRowSelection: true,
      enableSelectAll: true,
//      selectionRowHeaderWidth: 35,
      columnDefs: $scope.columns
    };
    $scope.serverColumns = [{ field: 'RegionName' }];
    $scope.serverOptions = {
      enableSorting: true
//      ,columnDefs: $scope.serverColumns
    };
    $scope.rdsColumns = [{field: 'name' }
                        ,{field: 'Endpoint.Address'}
                        ,{field: 'DBInstanceClass'}
                        ,{field: 'Engine'}
                        ,{field: 'AvailabilityZone'}
    ];
    $scope.rdsOptions = {
      enableSorting: true
      ,data: $scope.rdsdb
      ,columnDefs: $scope.rdsColumns,
      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
      }
    };


// ui-grid is high performance, and doesn't want to be auto-updated, 
// so we have to tell it when to refresh, which we do by setting up change handlers
    $scope.obs = RdsDb.find().observeChanges({
      added:   function(){$scope.rdsUpdate()},
      removed: function(){$scope.rdsUpdate()},
      changed: function(){$scope.rdsUpdate()}
    });

// Each handler calls this method, it uses a timer to prevent multiple refreshes, 
// eg when the records are inserted in bulk
    $scope.rdsUpdate = function () {
      if ($scope.rdsChange == 0) {
        console.log("RDS CHange");
        $scope.rdsChange++;
        $timeout( function(){ 
          if (--$scope.rdsChange == 0) {
            $scope.rdsOptions.data = $scope.rdsdb;
          } 
        }, 200);
      }
    };

// Sets the AWS Access keys
    var addAccessKey = function(){
      if (!Meteor.settings.public.awsAccessKeyId)
        console.log("AccessKeyId is missing - did you run meteor with --settings?");
      if ($scope.showJSON)
        console.log("key="+Meteor.settings.public.awsAccessKeyId);
      AWS.config.update({accessKeyId: Meteor.settings.public.awsAccessKeyId, 
                    secretAccessKey: Meteor.settings.public.awsSecretKey});
    };

    $scope.toggleDiags = function(){
      $scope.showJSON = !$scope.showJSON;
    };

    $scope.getAWSData = function(){
// There is a slight timing problem here, as the 2nd function relies on 
// the RDS data already being present, but it won't be, because the RDS data
// is loaded asynchronously by the server, and we don't know when it's there
// Although we do have a handler of a kind above, which is performance sensitive :)
// Might need to extend it to add the RDS entries as they come, which will improve things.
      addAccessKey();
      $scope.getRegions();
      $scope.getRDSDBS();
    };


//----------------------------------
// This is to start/stop a EC2 Service
    $scope.startMe = function(node){
      var ec2 = new AWS.EC2({region: node.region});
      addAccessKey();
      var params = {
        DryRun: $scope.showJSON
        ,InstanceIds: [node.id]
      };
      console.log("Starting instance "+node.id);
      node.status = "Starting...";
      ec2.startInstances(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
//          console.log(data);           // successful response
        } 
      });
    };

    $scope.stopMe = function(node){
      var ec2 = new AWS.EC2({region: node.region});
      addAccessKey();
      var params = {
        DryRun: $scope.showJSON
        ,InstanceIds: [node.id]
      };
      console.log("Stopping instance "+node.id);
      node.status = "Stopping...";
      ec2.stopInstances(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
//        else     console.log(data);           // successful response
      });
    };
//----------------------------------
// This is a fetch of AWS REGIONS by calling the API client side
    $scope.getRegions = function(){
      $scope.regionError = 'Loading...';
      $scope.awsData = [];  // Clear out the existing tree
      dbData = [];

      console.log("Calling server process to get AWS EC2 Region data sources");
//      console.log(AWS);

      addAccessKey();
      var ec2 = new AWS.EC2({region: 'ap-southeast-2'});
      ec2.describeRegions(function(error, data) {
        if (error) {
          console.log(error); // an error occurred
          $scope.regionError = error.messtype;
        } else {
          $scope.regionError = '';
//          console.log(data); // request succeeded
          $scope.ec2RegionCB(null, data);
        }
      });
    };
    $scope.ec2RegionCB = function(err,result) {
        console.log("In ec2RCB callback, returned ");
//        console.log(result);
        $scope.regionData = result;
        $scope.$apply(function () {$scope.regionOptions.data = $scope.regionData.Regions;});
        _.each($scope.regionOptions.data, function (rds) {
          $scope.awsData.push({name: rds.RegionName, children: [], type: 'Region'});
          var ec2 = new AWS.EC2({region: rds.RegionName});
          ec2.describeInstances(function(error, data) {
            if (error) {
              console.log(error); // an error occurred
              $scope.serverError = error.messtype;
            } else {
              $scope.serverError = '';
//              console.log(data); // request succeeded
              $scope.ec2CB(null, data);
            }
          });
        });
        _.each($scope.rdsdb, function(rds) {
          console.log("Checking RDS "+rds.name);
          _.each($scope.awsData, function(region){
            var re = new RegExp(region.name);
            if (rds.AvailabilityZone.search(re) !== -1){
              rds.type = 'RDS';
//              rds.name = rds.DBInstanceIdentifier;
//              delete rds.DBInstanceIdentifier
              region.children.push(rds);
            }
          });
        });
      };

//----------------------------------
// This is a fetch of EC2 Servers by calling the API client side
    $scope.getEC2 = function(){
      $scope.serverError = "Loading..."
      console.log("Calling server process to get AWS EC2 servers");
//      console.log(AWS);
      dbData = [];
      addAccessKey();

      _.each($scope.regionOptions.data, function (rds) {
        var ec2 = new AWS.EC2({region: rds.RegionName});
        ec2.describeInstances(function(error, data) {
          if (error) {
            console.log(error); // an error occurred
            $scope.serverError = error.messtype;
          } else {
            $scope.serverError = '';
//            console.log(data); // request succeeded
            $scope.ec2DBCB(null, data);
          }
        });
      });
    };
    $scope.ec2CB = function(err,result) {
        console.log("In ec2CB callback, returned ");
//        console.log(result);

        $scope.databaseData = result;
        $scope.dbData = result.Reservations;
        _.each(result.Reservations, function (res) {
          _.each(res.Instances, function (inst) {
//            console.log("Tags");
//            console.log(inst.Tags);
            var serverName = inst.KeyName;
            _.each(inst.Tags, function (tag) {
              if (tag.Key === 'Name')
                serverName = tag.Value;
            });

            var db = {
              name: serverName
              ,id: inst.InstanceId
              ,status: inst.State.Name
              ,ipaddr: inst.PublicIpAddress
              ,zone: inst.Placement.AvailabilityZone
              ,region: inst.Placement.AvailabilityZone
              ,type: 'EC2'
            };
            dbData.push(db);
            _.each($scope.awsData, function(region){
              var re = new RegExp(region.name);
              if (db.region.search(re) !== -1){
                db.region = region.name;
                region.children.push(db);
              }
            });
          });
        }); 
        $scope.$apply(function () {$scope.serverOptions.data = dbData;});
        };


//----------------------------------
// Clear out the RDS entries
    $scope.clrRDSDBS = function(){
      console.log("Clearing RDS data");
      Meteor.call('clrAWSRDSDB');
    };
//----------------------------------
// Go to the server for this one...
    $scope.getRDSDBS = function(){
      console.log("Calling server process to get RDS data");
      Meteor.call('getAWSRDSDB', $scope.rdsCB);
    };
    $scope.rdsCB = function(err,result) {
        // Nothing comes back, so the callback is academic
    };

    $scope.getAWSData();

} ]);
