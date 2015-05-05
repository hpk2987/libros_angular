'use strict';

angular.module('booksApp.books', ['ngRoute'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/books', {
			templateUrl: "books/books.html",
			controller: 'BooksController'
		});
	}])
	.factory('Books',function($q,$http,url){
		return {
			searchVolumes: function(query){
				return $http.get(url+"/books?q="+query)
				.then(function(response){
					return response.data;
				},function(response){
					return $q.reject(response.status + " " + response.data.message);
				})
			}
		}
	})
	.controller('BooksController', function($scope,Books) {
		$scope.alerts=[];

		$scope.executeQuery = function(){
			Books.searchVolumes($scope.query)
			.then(function(response){
				$scope.result = response;
			},function(notice){
				$scope.alerts.push({
					type: 'danger',
					msg: notice
				});
			});
		}
	});