angular.module('BUSzinga', [])
    .run(['RoutesService', function (routes) {
        'use strict';
        routes.init();
    }]);