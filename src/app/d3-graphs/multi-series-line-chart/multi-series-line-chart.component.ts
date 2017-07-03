import { Component, Input, ElementRef, NgZone, OnDestroy, OnInit, OnChanges, ViewChild, SimpleChange } from '@angular/core';
import { D3Service, D3, Axis, BrushBehavior, BrushSelection, D3BrushEvent, ScaleTime, ScaleLinear, ScaleOrdinal, Selection, Transition} from 'd3-ng2-service';

@Component({
  selector: 'app-multiserieslinechart',
  template: `<svg class="line-chart" width="384" height="240"></svg>`
})

export class MultiSeriesLineChartComponent implements OnInit, OnDestroy {

  @Input() graphAttribute: string;
  @Input() stockData: string;

  private d3: D3;
  private parentNativeElement: any;
  private d3Svg: Selection<SVGSVGElement, any, null, undefined>;
  private x: ScaleTime<number, number>;
  private updateFunction;

  constructor(element: ElementRef, private ngZone: NgZone, d3Service: D3Service) {
    this.d3 = d3Service.getD3();
    this.parentNativeElement = element.nativeElement;
  }

  ngOnDestroy() {
    if (this.d3Svg.empty && !this.d3Svg.empty()) {
      this.d3Svg.selectAll('*').remove();
    }
  }

  ngOnInit() {
    let self = this;
    let d3 = this.d3;
    let d3ParentElement: Selection<HTMLElement, any, null, undefined>;
    let d3Svg: Selection<SVGSVGElement, any, null, undefined>;
    let d3G: Selection<SVGGElement, any, null, undefined>; //  g: any;
    let width: number;
    let height: number;
    let x: ScaleTime<number, number>; // x
    let y: ScaleLinear<number, number>; //   y;
    let z: ScaleOrdinal<number, string>; //  z;
    let xAxis: any;
    let yAxis: any;
    let margin: any; 
    let line; 
    let dateData: any;
    let graphAttribute = this.graphAttribute;
    this.updateFunction = updateGraph;
    
    if (this.parentNativeElement !== null) {
      d3ParentElement = d3.select(this.parentNativeElement);
      d3Svg = d3ParentElement.select<SVGSVGElement>('svg');
      drawGraph(this.stockData);
    }

    function drawGraph(targetData){
      
      let processedStocks: any = JSON.parse(targetData);
      dateData = processedStocks.map((v) => v.values.map((v) => new Date(v.date) ))[0];
      margin = {top: 20, right: 80, bottom: 30, left: 50};
      width = +d3Svg.attr('width') - margin.left - margin.right;
      height = +d3Svg.attr('height') - margin.top - margin.bottom;
      
      d3G = d3Svg
            .append<SVGGElement>('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x = d3.scaleTime().range([0, width]);
      y = d3.scaleLinear().range([height, 0]);
      z = d3.scaleOrdinal<number, string>(d3.schemeCategory10);
      
      xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%b"));
      yAxis  = d3.axisLeft(y)
   
      line = d3.line()
        .curve(d3.curveBasis)
        .x( (d: any) => x(new Date(d.date)) )
        .y( (d: any) => y(d[graphAttribute]) );

      x.domain(d3.extent(dateData, (d: Date) => d ));

      let y0 = parseFloat(d3.min(processedStocks, function(c: any) { return d3.min(c.values, function(d) { return d[graphAttribute]; }); }));
      let y1 = parseFloat(d3.max(processedStocks, function(c: any) { return d3.max(c.values, function(d) { return d[graphAttribute]; }); }));
      y.domain([y0, y1]);

      z.domain(processedStocks.map(function(c) { return c.id; }));

      //drawAxis();
      d3G.append<SVGGElement>('g')
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      d3G.append('g')
        .attr("class", "axis axis--y")
        .call(yAxis)
        .append<SVGGElement>('text')
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("color", "#ff0000")
        .text("%");
        
      //drawPath();

      let stock = d3G.selectAll(".stock")
        .data(processedStocks)
        .enter().append<SVGGElement>('g')
        .attr("fill", "none")
        .attr("class", "stock")
        .on("mousemove", mousemove);

      stock.append('path')
        .attr("class", "line")
        .attr("d", (d : any) => line(d.values) )
        .style("stroke", (d : any) => z(d.id) );

      stock.append('text')
        .datum(function(d : any) { return {id: d.id, ticker_symbol: d.ticker_symbol, value: d.values[d.values.length - 1]}; })
        .attr("transform", (d) => "translate(" + x(new Date(d.value.date)) + "," + y(d.value[graphAttribute]*1) + ")" )
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "14px sans-serif")
        .attr('class', 'heeey')
        .text(function(d) { return d.ticker_symbol; });

      var focus = d3Svg.append("g")
          .attr("class", "focus")
          .style("display", "none");
    }

    function updateGraph(targetData){

      let processedStocks: any = JSON.parse(targetData);
      dateData = processedStocks.map((v) => v.values.map((v) => new Date(v.date) ))[0];
     
      x = d3.scaleTime().range([0, width]);
      y = d3.scaleLinear().range([height, 0]);
      z = d3.scaleOrdinal<number, string>(d3.schemeCategory10);
    	// Scale the range of the data again 
      x.domain(d3.extent(dateData, (d: Date) => d ));
      let y0 = parseFloat(d3.min(processedStocks, function(c: any) { return d3.min(c.values, function(d) { return d[graphAttribute]; }); }));
      let y1 = parseFloat(d3.max(processedStocks, function(c: any) { return d3.max(c.values, function(d) { return d[graphAttribute]; }); }));
      y.domain([y0, y1]);
      z.domain(processedStocks.map(function(c) { return c.id; }));
      
      console.log("check difference")
      xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%b"));
      
      let days = Math.ceil((dateData[dateData.length-1].setHours(0, 0, 0, 0) - dateData[0].setHours(0, 0, 0, 0)) / (1000 * 3600 * 24)); 
      console.log(days);
      if(days > 250){
          xAxis.tickFormat(d3.timeFormat("%b"));
      }
      else{
            
      }
      
      let newD3Svg = d3Svg.transition();
      let newd3G = d3Svg.selectAll(".stock").transition();
      let line = d3.line()
        .curve(d3.curveBasis)
        .x( (d: any) => x(new Date(d.date)) )
        .y( (d: any) => y(d[graphAttribute]) );

        // Make the changes
        newd3G.select(".line")   // change the line
            .duration(750)
            .attr("d", (d : any) => line(d.values) )
           .style("stroke", (d : any) => z(d.id) );
            
        newD3Svg.select(".axis--x") // change the x axis
            .duration(750)
            .call(xAxis);

        newD3Svg.select(".axis--y") // change the y axis
            .duration(750)
            .call(yAxis);
            
            /*
            var svg = d3.select("body").transition();

    // Make the changes
        svg.select(".line")   // change the line
            .duration(750)
            .attr("d", valueline(data));
        svg.select(".x.axis") // change the x axis
            .duration(750)
            .call(xAxis);
        svg.select(".y.axis") // change the y axis
            .duration(750)
            .call(yAxis);*/

    }

    function mousemove(){
      var x0 = x.invert(d3.mouse(this)[0]);
      var y0= d3.mouse(this)[1];
      //var i = this.stock(processedStocks, x0, 1);
      //var d0 = d3G.data[i - 1];
      //var d1 = d3G.data[i];
      console.log("x0" + x0);
       //console.log("d0" + d0);
        //console.log("d1" + d1);
    }
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if ( changes['stockData'] &&  !changes['stockData'].isFirstChange()){
      this.updateFunction(changes["stockData"].currentValue);
    }
  }
}