angular.module('BUSzinga').controller('rlMap', [
    '$scope', 'StreetsService', 'VehiclesService', 'Point', 'MAP.CONF',
    function ($scope, Streets, Vehicles, Point, config) {
        'use strict';
        var self = this;

        var draw;
        var interval;
        var routeSelected;
        var width, height;

        self.minPoint = new Point(config.minPoint.lat, config.minPoint.lon);
        self.maxPoint = new Point(config.maxPoint.lat, config.maxPoint.lon);

        self.drawMin = config.drawMin;
        self.drawMax = config.drawMax;

        var zoomScale = d3.scale.linear()
            .domain([0, config.maxZoom - 1])
            .range([self.drawMax, self.drawMin]);

        self.zoom = 11;
        self.center = { x: config.center.x, y: config.center.y };

        self.streets = [];
        self.vehicles = [];
        self.rulers = [];

        var drawRacio = self.drawMin / self.drawMax;
        var drawRadios = self.drawMax * 0.5;

        function streetVehicleInterpolation() {
            angular.forEach(self.vehicles, function (vehicle) {
                var street = self.streets[0];
                var dist;
                var target;

                function getPoint(street, j) {
                    var point1 = street.path[j].point;
                    var point2 = street.path[j + 1].point;
                    var t = vehicle.point.lineSegmentParameter(point1, point2);
                    t = t < 0 ? 0 : (t > 1 ? 1 : t);
                    var pointArray = d3.interpolate(point1.toArray(), point2.toArray())(t);
                    return new Point(pointArray[1], pointArray[0]);
                }

                var minPoint = getPoint(street, 0);
                var minDist = vehicle.point.distance(minPoint);

                var i = 1;
                var j = 2;
                while (i < self.streets.length) {
                    street = self.streets[i];
                    while (j < (street.path.length - 1)) {

                        target = getPoint(street, j);
                        dist = vehicle.point.distance(target);

                        if (dist < minDist) {
                            minDist = dist;
                            minPoint = target;
                        }

                        j++;
                    }
                    j = 0;
                    i++;
                }

                vehicle.point = minPoint;
            });
        }

        function setZoom(zoom) {
            zoom = zoom > 0 ? zoom : 0;
            zoom = zoom < config.maxZoom - 1 ? zoom : config.maxZoom - 1;
            self.zoom = zoom;
        }

        function incrementZoom(inc) {
            setZoom(self.zoom + inc);
        }

        function getDrawZoom() {
            return zoomScale(self.zoom);
        }

        function getScale(zoom) {
            zoom = (zoom || self.zoom);
            var normDrawZoom = zoomScale(zoom) - self.drawMin;
            var normMax = self.drawMax - self.drawMin;
            var scale = normDrawZoom / normMax;
            return drawRacio + (scale * (1 - drawRacio));
        }

        function calcPosition(pos, size) {
            var scale = getScale();
            var limit = drawRadios - ((size * 0.5) / scale);
            limit = limit > 0 ? limit : 0;

            var flag;
            var scaledMove = pos / scale;
            if (pos < 0) {
                limit *= -1;
                flag = scaledMove > limit;
            } else {
                flag = scaledMove < limit;
            }

            return flag ? scaledMove : limit;
        }

        function setCenter(x, y) {
            self.center.x = calcPosition(x, width);
            self.center.y = calcPosition(y, height);
        }

        function move(x, y) {
            var scale = getScale();
            setCenter(self.center.x * scale + x, self.center.y * scale + y);
        }

        function selectVehicle(vehicles, x, y) {
            var scale = getScale();
            setCenter((drawRadios - x) * scale, (drawRadios - y)  * scale);
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
        }

        function fetchVehicles(animate) {
            return Vehicles.refresh(routeSelected).then(function (vehicles) {
                self.vehicles = vehicles;

                // streetVehicleInterpolation();

                draw.nonScaled(animate);
                return self.vehicles;
            });
        }

        function setWindow(w, h) {
            width = w;
            height = h;
        }

        function init(drawScaled, drawNonScaled) {
            draw = {
                scaled: drawScaled,
                nonScaled: drawNonScaled
            };

            $scope.$on('rlRouteSelector.changeRoute', function (ev, route) {
                routeSelected = route;
                Vehicles.getVehicles(route).then(function (vehicles) {
                    self.vehicles = vehicles;
                    draw.nonScaled();
                });
            });

            return Streets.getStreets().then(function (streets) {
                self.streets = streets;

                setRulers();
                draw.scaled();

                fetchVehicles();
                if (interval) {
                    clearInterval(interval);
                }
                interval = setInterval(function () {
                    fetchVehicles(true);
                }, config.refresh);

            });
        }

        self.init = init;
        self.move = move;
        self.setWindow = setWindow;
        self.setCenter = setCenter;
        self.selectVehicle = selectVehicle;
        self.getScale = getScale;
        self.setZoom = setZoom;
        self.getDrawZoom = getDrawZoom;
        self.incrementZoom = incrementZoom;
    }]);


