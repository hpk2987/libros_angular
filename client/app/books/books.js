'use strict';

angular.module('booksApp.books', [
	'ngRoute',
	'ui.bootstrap'
	])
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
	.controller('BookCategoryController', function(
		$scope,
		$rootScope,
		Shelves,
		Auth){

		$scope.init = function(book){
			var updateBookShelves = function(){
				$scope.shelves = [];
				Object.keys(Auth.user.shelves).forEach(function(key,index){
					if(Auth.user.shelves[key].find(function(element){
						return element.id===book.id;
					})){
						$scope.shelves.push(key);
					}
				});
			}

			$scope.$on('shelfupdate',function(event,args){
				if(book===args){
					updateBookShelves();
				}
			});

			updateBookShelves();			

			$scope.removeFromShelf = function(shelf){
				if(confirm('Eliminar categoria?')){
					console.log(shelf,book);
					Shelves.removeFromShelf(shelf,book)
					.then(function(){
						$rootScope.$broadcast('shelfupdate',book);
					},function(notice){
						$scope.alerts.push({
							type: 'danger',
							msg: notice
						});
					})
				}
			}
		}
	})
	.controller('FavouriteController', function(
		$scope,
		$rootScope,
		Shelves,
		Auth){

		$scope.init = function(book){
			var updateRemaining = function(){
				$scope.remainingShelves = [];
				Object.keys(Auth.user.shelves).forEach(function(key,index){
					if(!Auth.user.shelves[key].find(function(element){
						return element.id===book.id;
					})){
						$scope.remainingShelves.push(key);
					}
				});
			}

			var updateInShelf = function(){
				$scope.isInShelf = false;				
				Object.keys(Auth.user.shelves).forEach(function(key,index){
					if(Auth.user.shelves[key].find(function(element){
						return element.id===book.id;
					})){
						$scope.isInShelf = true;
						return;
					}
				});
			}
					
			$scope.$on('shelveadd',function(event,args){
				updateRemaining();
			});

			$scope.$on('shelfupdate',function(event,args){
				if(book===args){
					updateRemaining();
					updateInShelf();
				}
			});

			updateRemaining();
			updateInShelf();
						
			$scope.addToShelf = function(shelf){
				Shelves.addToShelf(shelf,book)
				.then(function(){
					$rootScope.$broadcast('shelfupdate',book);
				},function(notice){
					$scope.alerts.push({
						type: 'danger',
						msg: notice
					});
				})
			}
		}
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
	})
	.directive('ellipsis', function ($timeout,$document) {
	    return {
	        link: function (scope, element, attrs) {
	        	$(window).resize(function(){
					$timeout(function () {
	    				//DOM has finished rendering
	    				element.ellipsis();
					});
	        	});

	            $timeout(function () {
    				//DOM has finished rendering
    				element.ellipsis();
				});
	        }
	    };
	});