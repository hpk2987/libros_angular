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
			searchVolumes: function(query,start,maxResults){
				return $http.get(url+
					"/books?q="+query+"&startIndex="+start+"&maxResults="+maxResults)
				.then(function(response){
					return response.data;
				},function(response){
					return $q.reject(response.status + " " + response.data.message);
				})
			},
			searchVolume: function(query){
				return $http.get(url+query)
				.then(function(response){
					return response.data;
				},function(response){
					return $q.reject(response.status + " " + response.data.message);
				})
			}
		}
	})
	.factory('Range',function(){
		return function(c){
			var range = [];
			for(var i=0;i<c;i++) {
				range.push(i);
			}
			return range;
		};
	})
	.factory('Pagination',function(Range){
		return {
			page:1,
			pageSize:10,
			startIndex:function(){
				return (this.page-1)*this.pageSize;
			},
			pageChange:function(){
				this.queryFunc();
			}
		};
	})
	.controller('BooksController', function(
			$scope,
			$location,
			$modal,
			$interval,
			Books,
			Pagination) {
		$scope.alerts=[];

		$scope.executeQuery = function(){
			Books.searchVolumes(
				$scope.query,
				$scope.pagination.startIndex(),
				$scope.pagination.pageSize)
			.then(function(response){
				$scope.result = response;
			},function(notice){
				$scope.alerts.push({
					type: 'danger',
					msg: notice
				});
			});
		};

		$scope.pagination = Pagination;
		$scope.pagination.queryFunc = $scope.executeQuery;

		// Modals
		$scope.modalLoading=false;
		$scope.viewBook = function (book) {
			var loading = $interval(
				function(){
					$scope.modalLoading=true;
				}, 500, 1);

			$scope.modalLoading=true;
			Books.searchVolume(book.href)
			.then(function(response){
				$interval.cancel(loading);
				$scope.modalLoading=false;
				$modal.open({
					animation: true,
				  	templateUrl: 'books/book.html',
				  	controller: 'BookController',
				  	size: 'lg',
				  	resolve: {
				  		book: function(){
				  			return response;
				  		}
				  	}
				});
			},function(notice){
				$scope.alerts.push({
					type: 'danger',
					msg: notice
				});
			});
		};
	});