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

    function AStarFinder(start, goal) {
        var allAstarNodes = [];

        function indexOfAStar(anodes, node) {
            return anodes.map(function (anode) {
                return anode.node;
            }).indexOf(node);
        }

        function isInAStarList(anodes, node) {
            return indexOfAStar(anodes, node) >= 0;
        }

        function aStarNodeFactory(node, gScore, fScore) {
            var nIdx = indexOfAStar(allAstarNodes, node);
            var aNode;
            if (nIdx >= 0) {
                aNode = allAstarNodes[nIdx];
            } else {
                aNode = {
                    node: node,
                    gScore: gScore,
                    fScore: fScore
                };
                allAstarNodes.push(aNode);
            }
            return aNode;
        }

        function heuristicCostEstimate(asNode1, asNode2) {
            return asNode1.node.point.distance(asNode2.node.point);
        }

        goal = aStarNodeFactory(goal, 0, 0);
        start = aStarNodeFactory(start, 0, 0);
        start.fScore = heuristicCostEstimate(start, goal);

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
            for (j = 1; j < openset.length; j++) {
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
                    tentativeGScore = current.gScore + current.node.distance[i];

                    if (!isInAStarList(openset, neighbor.node) || tentativeGScore < neighbor.gScore) {
                        cameFrom.push(current);
                        neighbor.gScore = tentativeGScore;
                        neighbor.fScore = neighbor.gScore + heuristicCostEstimate(neighbor, goal);

                        if (!isInAStarList(openset, neighbor.node)) {
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