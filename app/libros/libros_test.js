'use strict';

describe('librosApp.libros module', function() {

	beforeEach(angular.module('librosApp.libros'));

	describe('libros LibrosController', function() {

		it('should be defined', angular.inject(function($controller) {
			var controller = $controller('LibrosController');
			expect(controller).toBeDefined();
		}));


		it('should have libros defined', angular.inject(function($controller) {
			var controller = $controller('LibrosController');
			expect(controller.libros).toBeDefined();
		}));

	});
});