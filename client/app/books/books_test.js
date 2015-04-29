'use strict';

describe('booksApp.books module', function() {
	var scope;

	beforeEach(module('booksApp.books'));

	describe('books BooksController', function() {

		it('should be defined', inject(function($controller,$rootScope) {
			scope = $rootScope.$new(); //get a childscope
			var controller = $controller('BooksController',{$scope:scope});
			expect(controller).toBeDefined();
		}));


		it('should have libros defined', inject(function($controller,$rootScope) {
			scope = $rootScope.$new(); //get a childscope
			var controller = $controller('BooksController',{$scope:scope});
			expect(scope.books).toBeDefined();
		}));

	});
});