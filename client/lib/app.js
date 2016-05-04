// create your module with ag-Grid as a dependency
var app = angular.module("sentriumApp", 
	["angular-meteor"
	,'ngRoute'
	,'ui.bootstrap'
	,'ui.codemirror'
	,'ui.grid'
	,'ngAnimate'
	,'ngMaterial'
	,'treeControl'
	]);

$(document).on('click', '.navbar-collapse.in', function (e) {
    if ($(e.target).is('a')) {
        $(this).collapse('hide');
    }
});




// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// S T A R T U P  Function
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Meteor.startup(function () {
});

