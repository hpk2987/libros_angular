'use strict';

angular.module('booksApp', [
		'ngRoute',
		'ngAnimate',
		'ngStorage',
		'angular-spinkit',
		'ui.bootstrap',
		'booksApp.books',
		'booksApp.shelves'
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
	.value('url', 'http://localhost:8000/api')
	.directive('focusme',function(){
		return{
			link:function(scope,element,attrs){
				element.focus();
			}
		}
	});