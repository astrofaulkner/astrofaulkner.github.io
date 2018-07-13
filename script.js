//Found here: https://bl.ocks.org/wboykinm/8a87b89f3600a7175f27
$.getJSON(
"talley_ho.json",
  function(data) {
    // process into geojson
    var devGeojson = {
      type: 'FeatureCollection',
      features: []
    };
    var devs = data;
    for (var i in devs) {
      if (devs[i].lat) {
        var feature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            //coordinates: [[devs[i].Site_lon, devs[i].Site_lat], [devs[i].lon, devs[i].lat]]
            coordinates: [devs[i].lon, devs[i].lat]
          }
        };
        devGeojson.features.push(feature);
      }
    }

    var devGeojson_sites = {
      type: 'FeatureCollection',
      features: []
    };
    for (var i in devs) {
      if (devs[i].Site_lat) {
        var feature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [devs[i].Site_lon, devs[i].Site_lat]
          }
        };
        devGeojson_sites.features.push(feature);
      }
    }

    // Add LOS example
    var devGeoLOS = {
      type: 'FeatureCollection',
      features: [{type: 'Feature', geometry: {type: 'LineString', coordinates: [[39,0],[0,39]]}}]
    };


  (function(w, d3, undefined) {
  "use strict";
  var width, height;

  function getSize() {
    width = w.innerWidth,
      height = w.innerHeight;
    if (width === 0 || height === 0) {
      setTimeout(function() {
        getSize();
      }, 100);
    } else {
      init();
    }
  }

  function init() {
    var orig = [25, 10];
    //Setup path for outerspace
    var space = d3.geo.azimuthal()
      .mode("equidistant")
      .translate([width/2, height/2]);
    space
      .scale(800);
    var spacePath = d3.geo.path()
      .projection(space)
      .pointRadius(1);

    //Setup path for globe
    var projection = d3.geo.azimuthal()
      .mode("orthographic")
      .translate([width/2, height/2])
      .scale(300)
      .origin(orig)
    var scale0 = projection.scale();
    var path = d3.geo.path()
      .projection(projection)
      .pointRadius(2);


    //Setup path for sites
    var sitePath = d3.geo.path()
      .projection(projection)
      .pointRadius(6);

    var sprojection = d3.geo.azimuthal()
      .mode("orthographic")
      .translate([width/2, height/2])
      .scale(6.61*scale0)
      .origin(orig)
    //Setup path for devs
    var devPath = d3.geo.path()
      .projection(sprojection)
      .pointRadius(6);

    /*
    //Setup path for RA/DEC projections
    var deepspace = d3.geo.azimuthal()
      .mode("orthographic")
      .translate([width/2, height/2])
      .scale(1e8)
      .origin(orig)
    var projPath = d3.geo.path()
      .projection(deepspace)
      .pointRadius(6);
    */

    //Setup zoom behavior
    var zoom = d3.behavior
      .zoom(true)
      .translate(projection.origin())
      .scale(projection.scale())
      .scaleExtent([50, 800])
      .on("zoom", move);

    var circle = d3.geo.greatCircle()
      .origin(orig);

    var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
        .call(zoom)
        .on("dblclick.zoom", null);

    //Create a list of random stars and add them to outerspace
    var starList = createStars(1000);
    var stars = svg.append("g")
      .selectAll("g")
      .data(starList)
      .enter()
      .append("path")
        .attr("class", "star")
        .attr("d", function(d) {
          spacePath.pointRadius(d.properties.radius);
          return spacePath(d);
        });
    svg.append("rect")
      .attr("class", "frame")
      .attr("width", width)
      .attr("height", height);

    //Create the base globe
    var backgroundCircle = svg.append("circle")
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', projection.scale())
      .attr('class', 'globe')
      .attr("filter", "url(#glow)")
      .attr("fill", "url(#gradBlue)");

    var countryG = svg.append("g"),
      devG = svg.append("g"),
      siteG = svg.append("g"),
      testLOS = svg.append("g"),
      globeFeatures,
      devFeatures,
      siteFeatures,
      lineFeatures,
      testFeatures;

    //Add all of the countries to the globe
    d3.json("world-countries.json", function(collection) {
      globeFeatures = countryG.selectAll(".feature")
        .data(collection.features);
      globeFeatures.enter().append("path")
        .attr("class", "feature")
        .attr("d", function(d) {
          return path(circle.clip(d));
        });
    });

    // add dev points to the globe
    devFeatures = devG.selectAll(".dev")
      .data(devGeojson.features);
    devFeatures.enter()
      .append("path")
        .attr("class", "dev")
        .attr("d", function(d) {
          return devPath(circle.clip(d));
        });

    // add site points to the globe
    siteFeatures = siteG.selectAll(".site")
      .data(devGeojson_sites.features);
    siteFeatures.enter()
      .append("path")
        .attr("class", "site")
        .attr("d", function(d) {
          return sitePath(circle.clip(d));
        });

    // add LOS lines to the globe
    //lineFeatures = losG.selectAll(".los")
    //  .data(devGeoLOS.features);
    //lineFeatures.enter()
    //  .append("path")
    //    .attr("class", "los")
    //    .attr("d", function(d) {
    //      return devPath(circle.clip(d))
    //  });

    /*
    // Test SVG Line
    testFeatures = testLOS.selectAll(".test")
      .data(devGeojson.features)
      .enter()
        .append("path")
          .attr("class", "test")
          .attr("d", function (d) {return los_projection(d)});
    */


    //Build out LOS projections
    function los_projection(d) {
      var s1_geo = {type: d.type,
                    geometry: {type: d.geometry.type, coordinates: d.geometry.coordinates[0]}};
      var s1 = devPath(circle.clip(s1_geo));

      var s2_geo = {type: d.type,
                    geometry: {type: d.geometry.type, coordinates: d.geometry.coordinates[1]}};
      var s2 = projPath(circle.clip(s2_geo));
      var splits = [s1.split(","),
                    s2.split(",")]
      return splits[0][0]+","+
             splits[0][1].split("m")[0]+"L"+
             splits[1][0].split("M")[1]+","+
             splits[1][1].split("m")[0]+"z";
    }

    //Redraw all items with new projections
    function redraw() {
      globeFeatures.attr("d", function(d) {
        return path(circle.clip(d));
      });
      devFeatures.attr("d", function(d) {
        return devPath(circle.clip(d));
      });
      siteFeatures.attr("d", function(d) {
        return sitePath(circle.clip(d));
      });
      //lineFeatures.attr("d", function(d) {
      //  return devPath(circle.clip(d));
      //});
      //testFeatures.attr("d", function(d) {
      //  return los_projection(d);
      //});
      stars.attr("d", function(d) {
        spacePath.pointRadius(d.properties.radius);
        return spacePath(d);
      });
    }

    function move() {
      if (d3.event) {
        var scale = d3.event.scale;
        var origin = [d3.event.translate[0] * -1, d3.event.translate[1]];
        projection.scale(scale);
        space.scale(800);
        sprojection.scale(scale*6.61);
        backgroundCircle.attr('r', scale);
        path.pointRadius(2 * scale / scale0);
        devPath.pointRadius(6 * scale / scale0);
        sitePath.pointRadius(6 * scale / scale0);
        projection.origin(origin);
        circle.origin(origin);
        sprojection.origin(origin);
        //globe and stars spin in the opposite direction because of the projection mode
        var spaceOrigin = [origin[0] * -1, origin[1] * -1];
        space.origin(spaceOrigin);
        //deepspace.origin(origin);
        redraw();
      }
    }

    function createStars(number) {
      var data = [];
      for (var i = 0; i < number; i++) {
        data.push({
          geometry: {
            type: 'Point',
            coordinates: randomLonLat()
          },
          type: 'Feature',
          properties: {
            radius: Math.random() * 1.5
          }
        });
      }
      return data;
    }

    function randomLonLat() {
      return [Math.random() * 360 - 180, Math.random() * 180 - 90];
    }
  }
  getSize();
}(window, d3));
});
