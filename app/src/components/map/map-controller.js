angular.module('BUSzinga').controller('rlMap', [
    '$scope', '$q', 'StreetsService', 'VehiclesService', 'NeighborhoodsService', 'Store', 'Point', 'MAP.CONF',
    function ($scope, $q, Streets, Vehicles, Neighborhoods, Store, Point, config) {
        'use strict';
        var self = this;

        var reDraw;
        var interval;
        var routeSelected;
        var width, height;

        self.minPoint = new Point(config.minPoint.lat, config.minPoint.lon);
        self.maxPoint = new Point(config.maxPoint.lat, config.maxPoint.lon);

        self.drawMin = config.drawMin;
        self.drawMax = config.drawMax;

        var zoomScaler = d3.scale.linear()
            .domain([0, config.maxZoom - 1])
            .range([self.drawMax, self.drawMin]);

        self.zoom = 11;
        self.center = { x: config.center.x, y: config.center.y };

        self.streets = [];
        self.vehicles = [];
        self.rulers = [];

        var drawRacio = self.drawMin / self.drawMax;
        var drawRadios = self.drawMax * 0.5;

        function setZoom(zoom) {
            zoom = zoom > 0 ? zoom : 0;
            zoom = zoom < config.maxZoom - 1 ? zoom : config.maxZoom - 1;
            self.zoom = zoom;
        }

        function incrementZoom(inc) {
            setZoom(self.zoom + inc);
        }

        function getDrawZoom() {
            return zoomScaler(self.zoom);
        }

        function getScale(zoom) {
            zoom = (zoom || self.zoom);
            var normDrawZoom = zoomScaler(zoom) - self.drawMin;
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
            });
        }

        function fetchStreets() {
            return Streets.getStreets().then(function (streets) {
                self.streets = streets;
            });
        }

        function fetchNeighborhoods() {
            return Neighborhoods.getNeighborhoods().then(function (neighborhoods) {
                self.neighborhoods = neighborhoods;
            });
        }

        function setWindow(w, h) {
            width = w;
            height = h;
        }

        function init(drawBackground, reDrawFn) {
            reDraw = reDrawFn;

            $scope.$on('rlRouteSelector.changeRoute', function (ev, route) {
                routeSelected = route;
                Vehicles.getVehicles(route).then(function (vehicles) {
                    self.vehicles = vehicles;
                    if (route) {
                        self.route = Store.get('route', route);
                    }
                    reDraw();
                });
            });

            if (interval) {
                clearInterval(interval);
            }
            interval = setInterval(function () {
                fetchVehicles();
                reDraw(true);
            }, config.refresh);

            return $q.all([
                fetchStreets(),
                fetchNeighborhoods(),
                fetchVehicles()
            ]).then(function () {
                setRulers();
                drawBackground();
                reDraw();
            });
        }

        self.init = init;
        self.move = move;
        self.setWindow = setWindow;
        self.setCenter = setCenter;
        self.selectVehicle = selectVehicle;
        self.getScale = getScale;
        self.zoomScaler = zoomScaler;
        self.setZoom = setZoom;
        self.getDrawZoom = getDrawZoom;
        self.incrementZoom = incrementZoom;
    }]);


