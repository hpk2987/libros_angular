angular.module('booksApp')
	/* Handle login */
	.controller('NavbarController', function($scope,$location, Auth) {		
		$scope.logoutUser = function(){
			Auth.logout();
			$location.path('/login');
		}

		$scope.goHome = function(){
			$location.path('/');
		}

		$scope.goFavourite = function(){
			$location.path('/favourites');
		}
	})