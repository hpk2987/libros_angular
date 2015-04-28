'use strict';

angular.module('booksApp.books', ['ngRoute'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/books', {
			templateUrl: "libros/books.html",
			controller: 'BooksController'
		});
	}])
	.controller('BooksController', function($scope) {
		var authors = [{
			id: 1,
			name: 'dr'
		}];

		$scope.books = [{
			name: "abc",
			author: authors[0]
		}];
	});