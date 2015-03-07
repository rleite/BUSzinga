angular.module('BUSzinga').factory('Store', function () {
    'use strict';
    var mainStore = {};

    function getStore(storeKey) {
        return mainStore[storeKey] || (mainStore[storeKey] = {});
    }

    function register(storeKey, dataKey, data) {
        return getStore(storeKey)[dataKey] = data;
    }

    function get(storeKey, dataKey) {
        return getStore(storeKey)[dataKey];
    }

    return {
        get: get,
        register: register
    };
});