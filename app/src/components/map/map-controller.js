angular.module('BUSzinga').controller('rlMap', [
    'StreetsService', 'Point', 'Store',
    function (Streets, Point, Store) {
        'use strict';
        var self = this;

        self.minScale = 200;
        self.maxScale = 3000;
        // init scale as 10%
        self.scale = self.minScale + ((self.maxScale - self.minScale) * 0.10);

        function incrementScale(inc) {
            var update = self.scale + inc;
            update = update > self.minScale ? update : self.minScale;
            update = update < self.maxScale ? update : self.maxScale;
            self.scale = update;
        }

        function getScaleRate() {
            var normScale = self.scale - self.minScale;
            var normMax = self.maxScale - self.minScale;
            return normScale / normMax;
        }

        function setLimits() {
            self.limits = [
                {
                    point1: self.minPoint,
                    point2: new Point(self.minPoint.lat, self.maxPoint.lon)
                }, {
                    point1: self.minPoint,
                    point2: new Point(self.maxPoint.lat, self.minPoint.lon)
                }, {
                    point1: new Point(self.maxPoint.lat, self.minPoint.lon),
                    point2: self.maxPoint
                }, {
                    point1: new Point(self.minPoint.lat, self.maxPoint.lon),
                    point2: self.maxPoint
                }
            ];
        }

        function init() {
            return Streets.getStreets().then(function (data) {
                var streets = [];
                angular.forEach(data, function drawStreetPath(street) {
                    var i;
                    var path = street.path;
                    var len = path.length;
                    for (i = 1; i < len; i++) {
                        streets.push({
                            point1: path[i - 1],
                            point2: path[i]
                        });
                    }
                });
                self.streets = streets;
                self.minPoint = Store.get('pointEdges', 'min');
                self.maxPoint = Store.get('pointEdges', 'max');
                setLimits();
            });
        }

        self.incrementScale = incrementScale;
        self.getScaleRate = getScaleRate;
        self.init = init;
    }]);