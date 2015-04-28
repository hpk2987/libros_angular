'use strict';

angular.module('booksApp')
	.controller('LoginController', function($scope,$location, Auth) {
		$scope.alerts = [];
		$scope.loginUser = function(event) {
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
	})
	.factory('Auth', function($q, $http, url) {
		var user;

		return {
			setUser: function(aUser) {
				user = aUser;
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
	.run(function($rootScope, $location, Auth) {
		$rootScope.$on('$routeChangeStart', function(event, next, current) {

			if (!Auth.isLoggedIn()) {
				console.log('DENY');
				// no logged user, redirect to /login
				if (next.templateUrl != "login.html") {
					$location.path("/login");
				}
			} else {
				console.log('ALLOW');
			}
		});
	});