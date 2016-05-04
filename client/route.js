
﻿angular.module("sentriumApp").config(['$routeProvider', '$locationProvider',
         function ($routeProvider, $locationProvider) {

             $locationProvider.html5Mode(true);

             $routeProvider
             .when('/', {
                templateUrl: 'client/things/views/aws.html',
                controller: 'awsController'
             })
             .when('/login', {
                 templateUrl: 'client/things/views/login.html',
                 controller: 'loginController'
             })
             .when('/logout', {
                 templateUrl: 'client/things/views/logout.html',
                 controller: 'loginController'
             })
             .otherwise({ redirectTo: '/' });

         } ]);

