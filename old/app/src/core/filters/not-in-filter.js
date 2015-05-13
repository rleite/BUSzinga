angular.module('BUSzinga').filter('notIn', function () {
    'use strict';
    return function (list, filterList) {
        list = list || [];
        filterList = filterList || [];
        return list.filter(function (item) {
            return filterList.indexOf(item) === -1;
        });
    };
});