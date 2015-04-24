'use strict';

angular.module('librosApp', [
	'ngRoute',
	"librosApp.libros"])
	.config(function($locationProvider) {
		$locationProvider.hashPrefix('!');
	})
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.otherwise({
			redirectTo: '/libros'
		});
	}]);