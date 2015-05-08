'use strict';

angular.module('booksApp.books')
	.controller('BookController',function(
			$scope,
			$location,
			$modalInstance,
			$sce,
			book,
			Books){	
		$scope.book = book;
		$scope.book.description = $sce.trustAsHtml(book.description);

		$scope.languages={
			es:"Español",
			en:"Inglés"
		}

		$scope.close = function(){
			$modalInstance.close();
		}
	});