Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});    

angular.module("sentriumApp").controller("loginController", ["$scope", "$meteor", "$routeParams", "$rootScope", "$sce", "$timeout", 
 function ($scope, $meteor, $routeParams, $rootScope, $timeout, $location) {

	Accounts.onLogin(function($location){
		console.log("Logged on ok");
// This caused a redirect loop in production
	//	document.location.href = "/";
	});

// No such handler ?
//  Accounts.onLogout(function($location){
//    console.log("signed off ok");
//  });

    Accounts._loginButtonsSession.set('dropdownVisible', true);
    $(".login-close-text").hide();      


    $scope.logout = function(){
        console.log("Logging out");
        $meteor.logout();
    }

    $scope.$on('$routeChangeSuccess', function (event, current) {
      console.log("Showing login page");
      Accounts._loginButtonsSession.set('dropdownVisible', true);
      $(".login-close-text").hide();      
    });

 }
  ]);
