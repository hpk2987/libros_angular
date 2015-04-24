'use strict';

angular.module('librosApp.libros', ['ngRoute'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/libros', {
			templateUrl: "libros/libros.html",
			controller: 'LibrosController'
		});
	}])
	.controller('LibrosController', function($scope) {
		var autores = [{
			id: 1,
			nombre: 'dr'
		}];

		$scope.libros = [{
			nombre: "abc",
			autor: autores[0]
		}];
	});