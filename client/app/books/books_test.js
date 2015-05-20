'use strict';

describe('booksApp.books module', function() {
	var scope;

	beforeEach(function(){
		/* Mock a servicio URL que provee booksApp */
		module(function($provide) {
			$provide.service('url', function() {
				return 'abc';
			});
		});
		/* Modulo a probar */
		module('booksApp.books');
	});

	describe('books BooksController', function() {

		it('should be defined', inject(function($controller,$rootScope) {
			scope = $rootScope.$new(); //get a childscope
			var controller = $controller('BooksController',{$scope:scope});
			expect(controller).toBeDefined();
		}));


		it('should have books defined', inject(function($controller,$rootScope) {
			scope = $rootScope.$new(); //get a childscope
			var controller = $controller('BooksController',{$scope:scope});
			expect(scope.executeQuery).toBeDefined();
		}));

	});
});