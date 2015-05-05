'use strict';

angular.module('booksApp', [
		'ngRoute',
		'ngStorage',
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
	/* Server REST API */
	.value('url', 'http://localhost:8000/api');