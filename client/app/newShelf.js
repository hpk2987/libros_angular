'use strict';

angular.module('booksApp')
	.controller('NewShelfController',function(
			$scope,
			$location,
			$modalInstance){
		$scope.cancel = function(){
			$modalInstance.dismiss('cancel');
		}

		$scope.apply = function(){
			$modalInstance.close($scope.shelf);
		}
	});