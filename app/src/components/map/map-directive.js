angular.module('BUSzinga')
    .directive('rlMap', ['$window', 'DrawToolkit', function ($window, DrawToolkit) {
        'use strict';
        var w = angular.element($window);

        function fnLink($scope, $elem, $attrs, mapCtrl) {
            $elem.addClass('rl-map');
            var xScale = d3.scale.linear();
            var yScale = d3.scale.linear();
            var elemDom = $elem[0];
            var width;
            var height;
            var mapContainer;
            var drawToolkit;

            var scaleValueElem;
            var scaleValueHeight;

            var svgElem;
            var map;

            function updateDimentions() {
                width = elemDom.offsetWidth;
                height = elemDom.offsetHeight;

                svgElem
                    .attr('width', width)
                    .attr('height', height);
            }

            function updateScaleValueHeight() {
                var margin = scaleValueHeight - Math.round(mapCtrl.getScale() * scaleValueHeight);
                scaleValueElem.css({
                    'margin-top': margin + 'px'
                });
            }

            function updateViewPort() {
                updateScaleValueHeight();

                var scale = mapCtrl.getScale();
                var scaleDim = Math.round(mapCtrl.drawRadios * scale);

                var centerX = Math.round(mapCtrl.center.x * scale);
                var centerY = Math.round(mapCtrl.center.y * scale);

                var translateX = (width * 0.5) + centerX - scaleDim;
                var translateY = (height * 0.5) + centerY - scaleDim;

                angular.element(map[0]).css({
                    transform: 'scale(' + scale + ')'
                });
                angular.element(mapContainer[0]).css({
                    transform: 'translateX(' + translateX + 'px)' +
                        ' translateY(' + translateY + 'px)'
                });
            }

            function setScales() {
                var minPoint = mapCtrl.minPoint;
                var maxPoint = mapCtrl.maxPoint;

                xScale
                    .domain([minPoint.lon, maxPoint.lon])
                    .range([0, mapCtrl.drawRadios * 2]);

                yScale
                    .domain([minPoint.lat, maxPoint.lat])
                    .range([0, mapCtrl.drawRadios * 2]);
            }

            function drawMap() {
                updateDimentions();
                setScales();

                drawToolkit.drawLines(mapCtrl.rulers, 'ruler');
                drawToolkit.drawLines(mapCtrl.streets, 'street');
            }

            function drawVehicles() {
                drawToolkit.drawCircles(mapCtrl.vehicles, 'vehicle')
                    .attr('r', function () {
                        return 50;
                    });
            }

            function setUpControls() {
                var lastX;
                var lastY;
                var isDown;

                $elem.bind('wheel', function (event) {
                    mapCtrl.incrementScale(Math.round(event.wheelDeltaY * 0.6));
                    mapCtrl.move(0, 0, width, height);
                    updateViewPort();
                });

                $elem.bind('mousedown', function (event) {
                    isDown = true;
                    lastX = event.x;
                    lastY = event.y;
                });
                $elem.bind('mouseup', function () {
                    isDown = false;
                });

                $elem.bind('mousemove', function (event) {
                    if (isDown) {
                        var moveX = lastX - event.x;
                        var moveY = lastY - event.y;
                        lastX = event.x;
                        lastY = event.y;

                        mapCtrl.move(-moveX, -moveY, width, height);
                        updateViewPort();
                    }
                });

            }

            function init() {
                // defined 
                scaleValueElem = angular.element(elemDom.querySelector('.scale-value'));
                scaleValueHeight = scaleValueElem[0].offsetHeight;

                svgElem = d3.select(elemDom).append('svg');
                mapContainer = svgElem.append('g');
                map = mapContainer.append('g').attr('class', 'map-frame');
                updateDimentions();

                drawToolkit = new DrawToolkit(map, function (d) {
                    return xScale(d.point.lon);
                }, function (d) {
                    return (mapCtrl.drawRadios * 2) - yScale(d.point.lat);
                });

                mapCtrl.init()
                    .then(function () {
                        drawMap();
                        updateViewPort();
                        w.bind('resize', function () {
                            updateDimentions();
                            mapCtrl.move(0, 0, width, height);
                            updateViewPort();
                        });

                        setUpControls();
                    })
                    .then(mapCtrl.getVehicles)
                    .then(drawVehicles);
            }

            init();
        }

        return {
            templateUrl: 'src/components/map/map.html',
            controller: 'rlMap',
            controllerAs: 'rlMap',
            bindToController: true,
            link: fnLink
        };
    }]);