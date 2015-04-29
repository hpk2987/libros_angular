'use strict';

angular.module('booksApp')
	/* Handle login */
	.controller('LoginController', function($scope,$location, Auth) {
		$scope.alerts = [];
		$scope.loginUser = function() {
			Auth.authenticate($scope.user)
				.then(function(user) {
					$location.path("/");
				}, function(notice) {
					$scope.alerts.push({
						type: 'danger',
						msg: notice
					});
				})
		}

		$scope.logoutUser = function(){
			Auth.setUser(null);
			$location.path("/login");
		}
	})
	/* Handle authentication and user data */
	.factory('Auth', function($q, $http,$rootScope, url) {
		var user;

		return {
			setUser: function(aUser) {
				user = aUser;
				$rootScope.user = user;
			},
			isLoggedIn: function() {
				return (user) ? user : false;
			},
			authenticate: function(user) {
				var me = this;

				return $http.post(url + '/authenticate', user)
					.then(function(response) {
						me.setUser({
							username: user.username,
							token: response.data
						});
						return response.data;
					}, function(response) {
						return $q.reject(response.status + " " + response.data.message);
					});
			}
		}
	})
	/* Redirect to login if not logged */
	.run(function($rootScope, $location, Auth) {
		$rootScope.$on('$routeChangeStart', function(event, next, current) {

			if (!Auth.isLoggedIn()) {
				// no logged user, redirect to /login
				if (next.templateUrl != "login.html") {
					$location.path("/login");
				}
			}
		});
	});