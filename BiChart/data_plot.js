function on(){

  var projection = d3.geo.orthographic()
    .clipAngle(90);

  var svg = d3.select("body").append("svg")
    .attr("width", 960.)
    .attr("height", 600.)
    .style("display", "block");

  var allPoints = [];
  for (var lat = -90; lat < 90; lat=lat+10) {
    for (var lon = -180; lon < 180; lon=lon+10) {
      allPoints.push(projection([lon, lat]));
    }
  }

  var intersections = svg.selectAll('.gridpoints')
    .data(allPoints)
    .enter().append('circle', '.gridpoints')
      .attr('cy', d => d[0])
      .attr('cx', d => d[1])
      .attr('fill', 'red')
      .attr('r', 5);
}
