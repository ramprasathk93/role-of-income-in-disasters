/**
 * Created by iRam on 4/6/17.
 */

var width = 900;
var height = 400;

var width1 = 900;
var height1 = 600;

//initialising mercator projection
var projection = d3.geo.mercator()
    .scale(width / 2 / 4)
    .translate([0, 0]);

var path = d3.geo.path()
    .projection(projection);

// svg for choropleth map
var svg = d3.select("#chmaps").append("svg")
    .attr("width", width)
    .attr("height", height);

//defining groups
var outterg = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 1.7+ ")");
var g = outterg.append("g").attr("id", "innerg");

svg.append("text")
    .attr("x", 0)
    .attr("y", 210)
    .text("Democracy Score")
    .attr("font-family","sans-serif")
    .attr("fill", "black");

//defining color scale
var color = d3.scale.category20c().domain(d3.range(0,20));

//defining tooltip
var tooltip = d3.select("body").append("div").attr("class", "tooltip hidden");
//temporary data to access the color index
var legendindex = [19, 17, 15, 13, 11, 9, 7, 5, 3, 0];

//setting a legend
var legend = svg.selectAll("rect")
    .data(legendindex)
    .enter().append("rect")
    .attr({
        x: 20,
        y: function(d, i){ return i*18 + 220},
        width: 35,
        height: 17
    })
    .style("fill", function(d) { return color.range()[d]; });

var text_legend = svg.selectAll("text")
    .data(d3.range(0,10))
    .enter().append("text")
    .attr({
        x: 60,
        y: function(d){ return d*20 + 215;}
    })
    .text(function(d){ return d + " to " + (d+1)})
    .attr("fill", "black")
    .attr("font-family", "sans-serif")
    .attr("font-size", "14px");

// loadind the data using queue
queue()
    .defer(d3.json, "/FinalVisual/world-110m-cia.json")
    .defer(d3.csv, "/FinalVisual/disastervisual.csv")
    .await(ready);

function ready(error, world, disasters) {
    if (error) throw error;

    // drawing border for countries
    topo = topojson.feature(world, world.objects.countries).features;
    var country = d3.select("#innerg").selectAll(".country").data(topo);

    //defining x-axis and y-axis scale
    var xScale = d3.scale.linear()
        .domain([1955, 2015])
        .range([0, width1]);

    var yScale = d3.scale.linear()
        .domain([0, 10000, 55000]) // polylinear scale
        .range([height1, height1/1.8, 100]);

    var scale = d3.scale.sqrt()
        .domain([d3.min(disasters, function (d) { return d.Deathperevent; }), d3.max(disasters, function (d) { return d.Deathperevent; })])
        .range([1, 5]);

    var opacity = d3.scale.sqrt()
        .domain([d3.min(disasters, function (d) { return d.Deathperevent; }), d3.max(disasters, function (d) { return d.Deathperevent; })])
        .range([1, .5]);

    // defining axis
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .innerTickSize(-height1+100)
        .outerTickSize(0)
        .tickPadding(10)
        .tickFormat(d3.format("d")); // no commas

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .innerTickSize(-width1)
        .outerTickSize(0)
        .tickPadding(5)
        .tickFormat(function (d) {
            if ((d / 1000) >= 1) {
                d = d / 1000 + "k"; // replacing thousands with k
            }
            return d;
        });

    var margin = {top: 0, right: 100, bottom: 100, left: 45};

    //offsets
    var offsetL = document.getElementById('chmaps').offsetLeft+30;
    var offsetT =530;

    //defining svg for the bubble chart
    var svg2 = d3.select("#bbchart").append("svg")
        .attr("width", width1 + margin.left + margin.right)
        .attr("height",720)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg2.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height1 + ")")
        .call(xAxis);

    // appending all the text labels in the visual
    svg2.append("text")
        .attr("x", 450)
        .attr("y", 640)
        .text("Year of Occurrence")
        .attr("text-anchor", "middle")
        .attr("font-family", "san-serif")
        .attr("font-size", "18px")
        .attr("fill", "black");

    svg2.append("text")
        .attr("x", -300)
        .attr("y", -30)
        .text("GDP per capita (in million US$)")
        .attr("text-anchor", "middle")
        .attr("font-family", "san-serif")
        .attr("font-size", "18px")
        .attr("fill", "black")
        .attr("transform", "rotate(-90)");

    svg2.append("text")
        .attr("x", 450)
        .attr("y", 15)
        .text("Institutional Breakdown")
        .attr("text-anchor", "middle")
        .attr("font-family", "san-serif")
        .attr("font-size", "18px")
        .attr("fill", "black");

    svg2.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg2.append("rect")
        .attr("class","instScore")
        .attr({
            x: 0,
            y: 25,
            width: 900,
            height: 40
        })
        .style("stroke","black")
        .style("fill", "white");

    svg2.append("text")
        .attr("x", 80)
        .attr("y", 80)
        .append("svg:tspan")
        .attr("x", 80)
        .attr("dy", 0)
        .text("Electoral process")
        .attr("text-anchor", "middle")
        .attr("font-family", "san-serif")
        .attr("font-size", "14px")
        .attr("fill", "black")
        .append("svg:tspan")
        .attr("x", 80)
        .attr("dy", 12.5)
        .text("and pluralism")
        .attr("text-anchor", "middle")
        .attr("font-family", "san-serif")
        .attr("font-size", "14px")
        .attr("fill", "black");

    svg2.append("text")
        .attr("x", 260)
        .attr("y", 80)
        .append("svg:tspan")
        .attr("x", 260)
        .attr("dy", 0)
        .text("Functioning of")
        .attr("text-anchor", "middle")
        .attr("font-family", "san-serif")
        .attr("font-size", "14px")
        .attr("fill", "black")
        .append("svg:tspan")
        .attr("x", 260)
        .attr("dy", 12.5)
        .text("Government")
        .attr("text-anchor", "middle")
        .attr("font-family", "san-serif")
        .attr("font-size", "14px")
        .attr("fill", "black");

    svg2.append("text")
        .attr("x", 260)
        .attr("y", 80)
        .append("svg:tspan")
        .attr("x", 260)
        .attr("dy", 0)
        .text("Functioning of")
        .attr("text-anchor", "middle")
        .attr("font-family", "san-serif")
        .attr("font-size", "14px")
        .attr("fill", "black")
        .append("svg:tspan")
        .attr("x", 260)
        .attr("dy", 12.5)
        .text("Government")
        .attr("text-anchor", "middle")
        .attr("font-family", "san-serif")
        .attr("font-size", "14px")
        .attr("fill", "black");

    svg2.append("text")
        .attr("x", 450)
        .attr("y", 80)
        .text("Political Participation")
        .attr("text-anchor", "middle")
        .attr("font-family", "san-serif")
        .attr("font-size", "14px")
        .attr("fill", "black");

    svg2.append("text")
        .attr("x", 630)
        .attr("y", 80)
        .text("Political Culture")
        .attr("text-anchor", "middle")
        .attr("font-family", "san-serif")
        .attr("font-size", "14px")
        .attr("fill", "black");

    svg2.append("text")
        .attr("x", 300)
        .attr("y", -910)
        .text("Size of the bubble signifies Deaths per event")
        .attr("text-anchor", "middle")
        .attr("font-family", "san-serif")
        .attr("font-size", "14px")
        .attr("fill", "black")
        .attr("transform", "rotate(90)");

    svg2.append("text")
        .attr("x", 800)
        .attr("y", 80)
        .text("Civil Liberties")
        .attr("text-anchor", "middle")
        .attr("font-family", "san-serif")
        .attr("font-size", "14px")
        .attr("fill", "black");

    svg2.append("line")
        .attr("x1", 180)
        .attr("y1", 25)
        .attr("x2", 180)
        .attr("y2", 65)
        .style("stroke", "black")
        .style("stroke-width", "2px");

    svg2.append("line")
        .attr("x1", 360)
        .attr("y1", 25)
        .attr("x2", 360)
        .attr("y2", 65)
        .style("stroke", "black")
        .style("stroke-width", "2px");

    svg2.append("line")
        .attr("x1", 540)
        .attr("y1", 25)
        .attr("x2", 540)
        .attr("y2", 65)
        .style("stroke", "black")
        .style("stroke-width", "2px");

    svg2.append("line")
        .attr("x1", 720)
        .attr("y1", 25)
        .attr("x2", 720)
        .attr("y2", 65)
        .style("stroke", "black")
        .style("stroke-width", "2px");

    // catching check bcx filtering event
    d3.selectAll(".demo-type").on("change", update);
    update();

    // updating on filter change
    function update(){
        var choices = [];

        // recording checkbox selections
        d3.selectAll(".demo-type").each(function(d){
           cb = d3.select(this);

           if (cb.property("checked")){
               choices.push(cb.property("value"));
           }
        });

        // filtering selected data
        if (choices.length > 0){
            newData = disasters.filter(function (f){
                return choices.includes(f.category);
            });
        }

        // drawing based on filtered data
        country.enter().insert("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("iso", function(d) {
                return d.iso; })
            .style("fill", function(d, i) {
                var m = newData.filter(function (f){
                    return f.countrycode == d.properties.iso;
                });

                if (m.length > 0){
                    var n = color(m[0].democracy_score);
                    return n; }
                else
                    return 'white';
            })
            .style("stroke", "#111")
            .on("mousemove", function(d,i) { // tooltip on mouse hover function
                var mouse = d3.mouse(svg.node()).map( function(d) { return d; } );
                var dem = ' | Democracy score: ';
                var m = newData.filter(function(f){return f.countrycode == d.properties.iso});

                if(m.length>0){
                    dem += (m[0].democracy_score);
                }

                tooltip.classed("hidden", false)
                    .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
                    .html(d.properties.name+dem);
            })
            .on("mouseout",  function(d,i) {
                tooltip.classed("hidden", true);
            });

        // filtering bubbles on check box selection
        var bubbles = svg2.selectAll(".bubbles").data(newData);

        // removing previous data
        bubbles.exit().remove();
        // adding the filtered data
        bubbles.enter()
            .append("circle");

        bubbles.attr("class", "bubbles")
            .attr("cx", function(d){
                return xScale(d.year); })
            .attr("cy", function(d){ return yScale(d.rgdpe); })
            .attr("r", function (d) { return scale(d.Deathperevent); })
            .style("fill",function(d) { return color(d.democracy_score); })
            .on('mouseover', function (d, i) {
                fade(d.democracy_score, .1); // calling fade colour function

                var mouse1 = d3.mouse(svg.node()).map( function(d) { return d; } );
                var msg = ' | Death per event: ';

                msg += Math.trunc(d.Deathperevent);
                tooltip.classed("hidden", false) // setting tooltip text on hover
                    .attr("style", "left:"+(mouse1[0]+offsetL)+"px;top:"+(mouse1[1]+offsetT)+"px")
                    .html(d.country+msg);
            })
            .on('mouseout', function (d, i) {
                fadeOut(); // calling fade out function
                tooltip.classed("hidden", true);
            })
            .on('click', function(d, i){ //function to handle on click event in bubbles
                var scoreData = [];
                scoreData.push(d.epp, d.fg, d.pp, d.pc, d.cl);
                var bars = svg2.selectAll(".bar").data(scoreData);

                // removing previous data
                bars.exit().remove();
                //appending new bars
                bars.enter()
                    .append("rect");
                //appending bars based on click
                bars.attr("class", "bar")
                    .attr("x", function(d, i){return 180*i + 3;})
                    .attr("y", 27.5)
                    .attr("rx", 5)
                    .attr("ry", 5)
                    .attr("height", 35)
                    .style("fill", color(d.democracy_score))
                    .transition()
                    .duration(1000)
                    .attr("width", function(d){ return (d/10)*175;});


                var labels = svg2.selectAll(".labels").data(scoreData);

                // removing and appending new labels
                labels.exit().remove();
                labels.enter().append("text");
                labels.attr("class", "labels")
                    .text(function(d){ return d; })
                    .attr("x", function(d, i){ return 180*i + 70;})
                    .attr("y", 50)
                    .style("stroke","black");
            });

        // function to filter and highlight all selected colors on hover
        function fade(c, opacity) {
            bubbles.filter(function (d) { return d.democracy_score != c; })
                .transition()
                .style("opacity", opacity);
        }

        // function to handle mouseout event from bubble
        function fadeOut() {
           bubbles.transition()
                .style("opacity", function (d) { opacity(d.Deathperevent); });
        }
    }
}
