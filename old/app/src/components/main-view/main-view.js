angular.module('BUSzinga')
    // .controller('MainView', [function () {
    //     'use strict';
    //     var self = this;
    // }])
    .directive('rlMainView', function () {
        'use strict';
        return {
            templateUrl: 'src/components/main-view/main-view.html'
            // controller: 'MainView',
            // controllerAs: 'mainView'
        };
    });