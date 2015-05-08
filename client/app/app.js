'use strict';

angular.module('booksApp', [
		'ngRoute',
		'ngAnimate',
		'ngStorage',
		'angular-spinkit',
		'ui.bootstrap',
		'booksApp.books'
	])
	.config(function($locationProvider) {
		$locationProvider.hashPrefix('!');
	})
	.config(function($routeProvider) {
		$routeProvider
			.when('/login', {
				templateUrl: "login.html",
				controller: 'LoginController'
			})
			.otherwise({
				redirectTo: '/books'
			});
	})
	.run(function($document){
		// Initialize foundation
		$document.foundation();
	})
	/* Server REST API */
	.value('url', 'http://localhost:8000/api');