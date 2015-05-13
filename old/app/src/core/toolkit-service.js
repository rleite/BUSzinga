angular.module('BUSzinga').factory('ToolkitService', function () {
    'use strict';
    function toArray(data) {
        var array;
        if (angular.isArray(data)) {
            array = data;
        } else {
            array = (data && [data]) || [];
        }
        return array;
    }

    return {
        toArray: toArray
    };
});