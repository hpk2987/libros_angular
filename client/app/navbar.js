angular.module('booksApp')
	/* Handle login */
	.factory('Shelves',function($http,$q,url,Auth){
		return{
			addShelf: function(shelf){
				return $http.put(url + Auth.user.user + '/shelves/' + shelf, {})
					.then(function(response) {
					},function(response){
						return $q.reject(response.status + " " + response.data.message);
					});
			},
			deleteShelf: function(shelf){
				return $http.delete(url + Auth.user.user + '/shelves/' + shelf, {})
					.then(function(response) {
					},function(response){
						return $q.reject(response.status + " " + response.data.message);
					});
			},
			addToShelf:function(shelf,book){
				return $http.put(url + Auth.user.user + '/shelves/' + shelf + '/' + book.id , book)
					.then(function(response) {
						Auth.user.shelves[shelf].push(book);
						},function(response){
						return $q.reject(response.status + " " + response.data.message);
					});
			},
			removeFromShelf: function(shelf,book){
				return $http.delete(url + Auth.user.user + '/shelves/' + shelf + '/' + book.id, {})
					.then(function(response) {
						Auth.user.shelves[shelf].splice(
							Auth.user.shelves[shelf].indexOf(JSON.stringify(book),1));
					},function(response){
						return $q.reject(response.status + " " + response.data.message);
					});
			},
			getShelves: function(){
				return $http.get(url + Auth.user.user + '/shelves')
				.then(function(response){
					return response.data;
				},function(response){
					return $q.reject(response.status + " " + response.data.message);
				})
			}
		}
	})
	.controller('ShelvesController', function(
		$scope,
		$rootScope,
		$location,
		Auth,
		Shelves,
		$modal){

		var updateShelves = function(){
			Shelves.getShelves()
			.then(function(data){
				$scope.user.shelves = data;
			},function(notice){
				$scope.alerts.push({
					type: 'danger',
					msg: notice
				});
			});
		}

		if(Auth.isLoggedIn()){
			updateShelves();
		}else{
			// Solo cuando este logeado
			$scope.$on('userlogin',function(event,args){
				updateShelves();
			});
		}

		$scope.goShelf = function(shelf){
			$location.path('/shelves/'+shelf);
		}

		$scope.$on('shelfdelete',function(event,args){
			Shelves.getShelves($scope.user)
			.then(function(shelves){
				$scope.user.shelves = shelves;
			},function(notice){
				$scope.alerts.push({
					type: 'danger',
					msg: notice
				});	
			});
		});
		
		$scope.newShelf = function(){
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'newShelf.html',
				controller: 'NewShelfController',
				size: "sm"
			});

			modalInstance.result.then(function (shelf) {				
				Shelves.addShelf(shelf)
				.then(function(){
					$scope.alerts.push({
						type: 'success',
						msg: 'La categoria se creó correctamente'
					});
					Shelves.getShelves($scope.user)
					.then(function(shelves){
						$scope.user.shelves = shelves;
						$rootScope.$broadcast('shelveadd');
					},function(notice){
						$scope.alerts.push({
							type: 'danger',
							msg: notice
						});	
					});
				},function(notice){
					$scope.alerts.push({
						type: 'danger',
						msg: notice
					});
				});
			}, function () {
				// dismissed
			});
		};
	})
	.controller('NavbarController', function($scope,$location, Auth,$interval) {
		$scope.alerts = [];

		if(Auth.isLoggedIn()){
			$scope.user = Auth.user;
		}else{
			// Solo cuando este logeado
			$scope.$on('userlogin',function(event,args){
				$scope.user = Auth.user;
			});
		}


		$scope.logoutUser = function(){
			Auth.logout();
			delete $scope.user;
			$location.path('/login');
		}

		$scope.goHome = function(){
			$location.path('/');
		}

		//Los mensajes se eliminan luego de 3 segundos
		$interval(function(){
			if(!$scope.alerts.some(
				element => element.type==='danger'||element.type==='warning')){
				$scope.alerts=[];
			}
		},7000);
	})