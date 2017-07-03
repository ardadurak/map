 function drawGraph(targetData){

      let processedStocks: any = JSON.parse(targetData);

      margin = {top: 20, right: 80, bottom: 30, left: 50};
      width = 384 - margin.left - margin.right,
      height = 240 - margin.top - margin.bottom;

      // Parse the date / time
      var parseDate = d3.timeFormat("%d-%b-%y");

      // Set the ranges
      x = d3.scaleTime().range([0, width]);
      y = d3.scaleLinear().range([height, 0]);

      // Define the axes
      xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%b"));
      yAxis  = d3.axisLeft(y);

      // Define the line
      var valueline = d3.line()
        // .curve(d3.curveBasis)
        .x(function(d : any) { debugger; return x(new Date(d.date)); })
        .y(function(d : any) { debugger;  return y(d[graphAttribute]); });
    

      // Adds the svg canvas
      let d3Svg = d3
                  .select(".line-chart")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom);
      let d3G = d3Svg
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Scale the range of the data
      x.domain(d3.extent(processedStocks, function(d : any) { return new Date(d.date); }));
      let y0 = parseFloat(d3.min(processedStocks, function(c: any) { return d3.min(c.values, function(d) { return d[graphAttribute]; }); }));
      let y1 = parseFloat(d3.max(processedStocks, function(c: any) { return d3.max(c.values, function(d) { return d[graphAttribute]; }); }));
      y.domain([y0, y1]);

      //let y0 = parseFloat(d3.min(processedStocks, function(c: any) { return d3.min(c.values, function(d) { return d[graphAttribute]; }); }));
      //let y1 = parseFloat(d3.max(processedStocks, function(c: any) { return d3.max(c.values, function(d) { return d[graphAttribute]; }); }));

      // Add the valueline path.
      d3Svg.append("path")
          .attr("class", "line")
          .attr("d", valueline(processedStocks));

      // Add the X Axis
      d3Svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      // Add the Y Axis
      d3Svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);
    }