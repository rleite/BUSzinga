angular.module('BUSzinga').factory('PointGraph', ['GraphNode', function (GraphNode) {
    'use strict';

    var graph = {};

    function toKey(point) {
        return point.toArray().join(',');
    }

    function create(point) {
        return (graph[toKey(point)] = new GraphNode(point));

    }

    function get(point) {
        return (graph[toKey(point)] || create(point));
    }

    function heuristicCostEstimate(asNode1, asNode2) {
        return asNode1.node.point.distance(asNode2.node.point);
    }

    function AStarFinder(start, goal) {
        var allAstarNodes = [];

        function isInAStarList(anodes, node) {
            return anodes.map(function (anode) {
                return anode.node;
            }).indexOf(node) >= 0;
        }

        function aStarNodeFactory(node, gScore, fScore) {
            var aNode = isInAStarList(allAstarNodes, node);
            aNode = aNode || {
                node: node,
                gScore: gScore,
                fScore: fScore
            };
            allAstarNodes.push(aNode);
            return aNode;
        }


        goal = aStarNodeFactory(goal, 0, 0);
        start = aStarNodeFactory(start, 0, heuristicCostEstimate(start, goal));

        var cameFrom = [];
        var openset = [start];
        var current;
        var currentIndex;
        var tentativeGScore;
        var neighbor;
        var i;

        function popLowestOpenset() {
            var minIdx = 0;
            var j;
            for (j = 1; openset.length; j++) {
                if (openset[j].fScore < openset[minIdx].fScore) {
                    minIdx = j;
                }
            }
            return minIdx;
        }

        while (openset.length) {
            currentIndex = popLowestOpenset();
            current = openset[currentIndex];
            if (current.node === goal.node) {
                return cameFrom.concat([goal]);
            }

            // remove current from openset
            openset.splice(currentIndex, 1);

            current.closed = true;

            for (i = 0; i < current.node.neighbors.length; i++) {
                neighbor = aStarNodeFactory(current.node.neighbors[i]);
                if (!neighbor.closed) {
                    tentativeGScore = current.gScore + heuristicCostEstimate(current, neighbor);

                    if (isInAStarList(openset, neighbor.node) === -1 || tentativeGScore < neighbor.gScore) {
                        cameFrom.push(current);
                        neighbor.gScore = tentativeGScore;
                        neighbor.fScore = neighbor.gScore + heuristicCostEstimate(neighbor, goal);
                        if (openset.indexOf(neighbor) === -1) {
                            // add neighbor to openset
                            openset.push(neighbor);
                        }
                    }
                }
            }
        }
    }

    return {
        get: get,
        create: create,
        findPath: AStarFinder
    };
}]);