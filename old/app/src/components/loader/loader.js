angular.module('BUSzinga')
    // Directive
    .directive('rlLoader', function () {
        'use strict';

        function getDots(n) {
            var dots = [];
            var i;
            for (i = 0; i < n; i++) {
                dots.push(i);
            }
            return dots;
        }

        function linkFn($scope, $elem) {
            $elem.addClass('rl-loader');

            var lapTime = 1500;
            var transTime = 30;
            var f = lapTime / transTime;

            var radios = 25;
            var diameter = radios * 2;

            var dotRadios = 5;
            var n = 100;

            var angle = (Math.PI * (3 / 2)) / n;
            var inc = 0;

            var board = d3.select($elem[0])
                .append('svg')
                .attr('width', diameter)
                .attr('height', diameter)
                .append('g');

            var colorScale = d3.scale.linear()
                .domain([0, n])
                .range(['#BCBCBC', '#F0F0F0']);

            function xScale(d) {
                return radios + Math.sin((angle * d) + inc) * (radios - dotRadios);
            }

            function yScale(d) {
                return radios + Math.cos((angle * d) + inc) * (radios - dotRadios);
            }

            function rScale(d) {
                return dotRadios * (1 - (d / n));
            }

            function move() {
                inc = inc - ((Math.PI * 2) / f);
                board.selectAll('circle')
                    .transition()
                    .duration(transTime)
                    .attr('cx', xScale)
                    .attr('cy', yScale);
            }

            board.selectAll('circle')
                .data(getDots(n))
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr('cx', xScale)
                .attr('cy', yScale)
                .attr('r', rScale)
                .attr('fill', colorScale);

            var intervalId = setInterval(move, transTime);

            $scope.$on('$destroy', function () {
                clearInterval(intervalId);
            });
        }

        return {
            link: linkFn
        };
    });