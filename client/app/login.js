'use strict';

angular.module('booksApp')
	/* Handle login */
	.controller('LoginController', function($scope,$location, Auth) {
		$scope.loginUser = function() {
			$scope.alerts = [];
			Auth.authenticate($scope.user)
				.then(function(user) {
					$location.path('/books');
				}, function(notice) {
					$scope.alerts.push({
						type: 'danger',
						msg: notice
					});
				})
		}
	})
	/* Handle authentication and user data */
	.factory('Auth', function($q, $http,$rootScope, url,$sessionStorage) {
		
		var svc = {
			logout: function(){
				delete this.user;
				$sessionStorage.$reset();
				$rootScope.$broadcast('userlogout');
			},
			setUser: function(aUser) {
				$sessionStorage.user = aUser;
				this.user = aUser;				
				$http.defaults.headers.common.Authorization = 'Bearer ' + this.user.token;
				$rootScope.$broadcast('userlogin');
			},
			isLoggedIn: function() {
				return (this.user) ? this.user : false;
			},
			authenticate: function(user) {
				var me = this;

				return $http.post(url + '/accesstokens', user)
					.then(function(response) {
						return $http.get(url + response.data.href)
						.then(function(response){
							me.setUser(response.data);

							return response.data;
						},function(response){
							return $q.reject(response.status + " " + response.data.message);
						});
					}, function(response) {
						return $q.reject(response.status + " " + response.data.message);
					});
			}
		}

		if($sessionStorage.user!=null){
			svc.setUser($sessionStorage.user);
		}

		return svc;
	})
	/* Redirect to login if not logged */
	.run(function($rootScope, $location, Auth) {
		$rootScope.$on('$routeChangeStart', function(event, next, current) {
			if (!Auth.isLoggedIn()) {
				// no logged user, redirect to /login
				if (next.templateUrl != "login.html") {
					$location.path('/login');
				}
			}else{
				// dont go to login if logged in already
				if (next.templateUrl == "login.html") {
					$location.path('/');
				}
			}
		});
	});