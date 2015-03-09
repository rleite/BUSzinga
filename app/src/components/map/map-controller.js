angular.module('BUSzinga').controller('rlMap', [
    '$q', 'StreetsService', 'VehiclesService', 'Point', 'Store',
    function ($q, Streets, Vehicles, Point, Store) {
        'use strict';
        var self = this;

        var vehivlesPromise;

        self.drawMin = 640;
        self.drawMax = 40000;
        var midPoint;

        self.zoom = self.drawMin;
        self.center = { x: 0, y: 0 };

        function incrementScale(inc) {
            var update = self.zoom + inc;
            update = update > self.drawMin ? update : self.drawMin;
            update = update < self.drawMax ? update : self.drawMax;
            self.zoom = update;
        }

        function getScale() {
            var normScale = self.zoom - self.drawMin;
            var normMax = self.drawMax - self.drawMin;
            var scale = normScale / normMax;
            var minZoomScale = self.drawMin / self.drawMax;
            return minZoomScale + (scale * (1 - minZoomScale));
        }

        function calcMove(move, size) {
            var scale = getScale();
            var limit = (self.drawMax * 0.5 * scale) - ((size / 2) * (1 - scale));
            limit = limit > 0 ? limit : 0;

            var flag;
            var scaledMove = move * scale;
            if (move < 0) {
                limit *= -1;
                flag = scaledMove > limit;
            } else {
                flag = scaledMove < limit;
            }

            return flag ? move : limit / scale;
        }

        function move(x, y, width, height) {
            var scale = getScale();

            self.center.x = calcMove(self.center.x + (x / scale), width);
            self.center.y = calcMove(self.center.y + (y / scale), height);
        }

        function setRulers() {
            var midLat = self.minPoint.lat + ((self.maxPoint.lat - self.minPoint.lat) / 2);
            var midLon = self.minPoint.lon + ((self.maxPoint.lon - self.minPoint.lon) / 2);
            self.rulers = [
                [ {point: self.minPoint}, {point: new Point(self.minPoint.lat, self.maxPoint.lon)} ],
                [ {point: self.minPoint}, {point: new Point(self.maxPoint.lat, self.minPoint.lon)} ],
                [ {point: new Point(self.maxPoint.lat, self.minPoint.lon)}, {point: self.maxPoint} ],
                [ {point: new Point(self.minPoint.lat, self.maxPoint.lon)}, {point: self.maxPoint} ],
                [ {point: new Point(self.maxPoint.lat, midLon)}, {point: new Point(self.minPoint.lat, midLon)} ],
                [ {point: new Point(midLat, self.minPoint.lon)}, {point: new Point(midLat, self.maxPoint.lon)} ]
            ];

            midPoint = {point: new Point(midLat, midLon)};
        }

        function init() {
            vehivlesPromise = Vehicles.getVehicles().then(function (vehicles) {
                vehivlesPromise = null;
                self.vehicles = vehicles;
                return self.vehicles;
            });

            return Streets.getStreets().then(function (data) {
                var streets = [];
                angular.forEach(data, function drawStreetPath(street) {
                    var i;
                    var path = street.path;
                    var len = path.length;
                    for (i = 1; i < len; i++) {
                        streets.push([{point: path[i - 1]}, { point: path[i]}]);
                    }
                });
                self.streets = streets;

                self.minPoint = Store.get('pointEdges', 'min');
                self.maxPoint = Store.get('pointEdges', 'max');
                setRulers();
            }).then(function () {
                self.vehicles.push(midPoint);
            });
        }

        function getVehicles() {
            return self.vehicles ? $q.when(self.vehicles) : vehivlesPromise;
        }


        self.init = init;
        self.getVehicles = getVehicles;
        self.move = move;
        self.getScale = getScale;
        self.incrementScale = incrementScale;
    }]);