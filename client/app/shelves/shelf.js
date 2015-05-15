angular.module('booksApp.shelves', ['ngRoute'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/shelves/:shelf', {
			templateUrl: 'shelves/shelf.html',
			controller: 'ShelfController'
		});
	}])
	.controller('ShelfController', function(
			$scope,
			$modal,
			$routeParams,
			$interval,
			$location,
			$rootScope,
			Auth,
			Shelves,
			Books) {
		$scope.alerts=[];

		$scope.books=Auth.user.shelves[$routeParams.shelf];
		$scope.title=$routeParams.shelf;

		$scope.deleteShelf = function(){
			if(confirm('Eliminar categoria?')){
				Shelves.deleteShelf($routeParams.shelf)
				.then(function(){
					$rootScope.$broadcast('shelfdelete');
					$location.path('/');
				},function(notice){
					$scope.alerts.push({
						type: 'danger',
						msg: notice
					});
				});
			}
		};

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