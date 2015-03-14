# BUSzinga

Bus track of san francisco Buses.

This is a side project to develep a **D3js/angularJS** app.

## Live now

[buszinga.iurleite.com](http://buszinga.iurleite.com)

## Features
- [X] generate map
- [X] map controls
    - [X] Wheel zoom
    - [X] Drag move
    - [X] map control directive
        - [X] scale ruler
        - [X] move and scale buttons
- [X] Place vehicles
    - [X] Center vehicles on click
    - [X] Vehicles street interpolation
    - [X] Vehicles move animation
    - [ ] Vehicles street move interpolation
- [X] Route
    - [X] Route filtering
    - [X] Vehicle's Route preview

## Issues
- Vehicles street interpolation (priority)
    - The code is breaking in few api calls(rarely).
- map control zoom
    - The zoom is too short near draw scale and too fast as the scale increases.

## BUS FEED API

- [NextBusXMLFeed](http://www.nextbus.com/xmlFeedDocs/NextBusXMLFeed.pdf)

- **Agency:** sf-muni