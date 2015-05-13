
function streetGroups() {
    var numGroups = 6;
    var minPoint = Store.get('streetPoint', 'min');
    var maxPoint = Store.get('streetPoint', 'max');

    var groupLonSize = (maxPoint.lon - minPoint.lon) / numGroups;
    var groupLatSize = (maxPoint.lat - minPoint.lat) / numGroups;

    function createGroup(i, j) {
        return new StreetGroup(
            // min
            minPoint.lon + (groupLonSize * i),
            minPoint.lat + (groupLatSize * j),
            // max
            maxPoint.lon + groupLonSize + (groupLonSize * i),
            maxPoint.lat + groupLatSize + (groupLatSize * j)
        );
    }

    var i, j;
    var currentGroup = createGroup(0, 0);
    var prevGroups = [];

    function groupByLat() {
        var currentGroup = createGroup(0, 0);
    }

    function groupByLon() {
        var targetStreets = [];

        function fitsInGroup() {
            while (i < (numGroups - 1))
                if (currentGroup.isInBoundsLon(street)) {
                    groupByLat()
                    break;
                } else {
                    changeGroup()
                    i++;
                }
            }
        }

        angular.forEach(streets, function (street) {


            // nextGroup
            // if (!nextGroup) {
            //     prevGroup = currentGroup;
            //     currentGroup = createGroup(0, 0);
            // }
        });
    }
}