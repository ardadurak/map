import { Stocks } from '../shared';
import { Component, ElementRef, Input, NgZone, OnChanges, OnDestroy, OnInit, SimpleChange } from '@angular/core';
import { D3Service, D3, Axis, BrushBehavior, BrushSelection, D3BrushEvent, ScaleLinear, ScaleOrdinal, Selection, Transition} from 'd3-ng2-service';
import * as Datamap from 'datamaps';

@Component({
  selector: 'app-datamap',
  template: `
    <div id="container" style="position: relative; width: 100%; height: 100%;"></div>
  `
})

export class DatamapComponent implements OnInit, OnChanges, OnDestroy {

  @Input() startDate: Date;
  @Input() endDate: Date;

  private d3: D3;
  private parentNativeElement: any;
  private d3Svg: Selection<SVGSVGElement, any, null, undefined>;
  private processedStocks : any;
  private filteredStocks : any;

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
    let d3G: Selection<SVGGElement, any, null, undefined>;
    let svgWidth: number, svgHeight: number;
    const xFactorUk = 0.3795136671202318, yFactorUk = 0.608870085225356;
    const xFactorUs = 0.4859626225320041, yFactorUs = 0.16291388766840606;
    let map = this.initMap();
    let grayColor = '#747474';
    let pieData : any;
    let processedStocks : any;

    processedStocks = this.processedStocks = this.processCalculations(Stocks);
    pieData = this.createPieData(processedStocks);
    
    d3ParentElement = d3.select(this.parentNativeElement);
    d3Svg = this.d3Svg = d3ParentElement.select<SVGSVGElement>('svg');

    d3Svg.append("circle")
      .attr("r", 50)
      .attr("fill", grayColor)
      .attr('class', 'circle-uk');
    
    d3Svg.append("circle")
      .attr("r", 50)
      .attr("fill", grayColor)
      .attr('class', 'circle-us');

    var arc : any= d3.arc()
       .innerRadius(20).outerRadius(40);

    var pie = d3.pie()
      .value(function(d: any){ return d });
 
    var pies = d3Svg.selectAll('.pie')
      .data(pieData)
      .enter()
      .append<SVGGElement>('g')
      .attr('class', 'pie')
      .attr('class', function(d: any){ return 'pie-' + d.country})
    
    pies.append("text")
      .attr("dy", ".5em")
      .style("text-anchor", "middle")
      .style("fill", function(d:any,i){return "white";})
      .text(function(d: any) { return d.average_daily_return});

    relocateComponents();

    var color = d3.scaleOrdinal(d3.schemeCategory10);
    
    pies.selectAll('.slice')
      .data(function(d: any){
      return pie([d.Group1, d.Group2]); })
      .enter()
      .append<SVGGElement>('path')
      .attr('d',  arc)
      .attr('cursor', 'pointer')
      .style('fill', function(d,i: any){
        return color(i);
      })
      .on("mouseover",function(d:any,i) {
        /*pies.select(this).append("text")
          .attr("dy", ".5em")
          .style("text-anchor", "middle")
          .style("fill", function(d:any,i){return "black";})
          .text(d.data)*/
      })
      .on("mouseout", function(d) {
       // pies.select("text").remove();
      })
      .on("click", function(d) {
        //pies.selectAll('.pie').transition().duration(750).attr("d", arcInitial);
        d3.select(this).transition()
          .duration(750)
          .attr("d", arcFinal);
      })
      


    var arcInitial = d3.arc()
      .startAngle(function(d){ return d.startAngle; })
      .endAngle(function(d){ return d.endAngle; })
      .innerRadius(20)
      .outerRadius(40);
    var arcFinal = d3.arc()
      .startAngle(function(d){ return d.startAngle; })
      .endAngle(function(d){ return d.endAngle; })
      .innerRadius(10)
      .outerRadius(40);  

    window.addEventListener('resize', function(event){
  
      map.resize();
      relocateComponents();
    });  

    function relocateComponents(){

      svgWidth = parseFloat( d3Svg.style("width"));
      svgHeight = parseFloat(d3Svg.style('height'));
      let xUk = svgWidth * xFactorUk, xUs = svgWidth * xFactorUs;
      let yUk = svgHeight * yFactorUk, yUs = svgHeight * yFactorUs;
      
      d3Svg.select('.circle-uk')
        .attr("cx", xUk)
        .attr("cy", yUk)

      d3Svg.select('.circle-us')
        .attr("cx", xUs) 
        .attr("cy", yUs)

      d3Svg.select('.pie-uk')      
        .attr("transform", ("translate(" + xUk + "," + yUk + ")"));
      
      d3Svg.select('.pie-us')      
        .attr("transform", ("translate(" + xUs + "," + yUs + ")"));
    }
  }


  public calculateReturn(targetObject){
    // Copy the target object
    let resultString = JSON.stringify(targetObject);
    let resultObject = JSON.parse(resultString);

    return resultObject.map((v) => {
      var length = v.values.length;
      let initialPrice = v.values[0].close ;
      let totalDailyReturn = 0;
      for(let i = 1 ; i < length ; i++){
        let currentValue = v.values[i];
        totalDailyReturn = totalDailyReturn + v.values[i].daily_return;
        v.values[i].change = ((currentValue.close-initialPrice) / initialPrice) * 100;  // change rate value
      }
      v.average_daily_return = totalDailyReturn / length;
      v.average_return = parseFloat((Math.round((Math.pow(((v.average_daily_return / 100) + 1 ), length) - 1) * 100 * 100)/ 100).toFixed(2));

      return v; 
    });
  }
  public processCalculations(targetObject){
    // Copy the target object
    let resultString = JSON.stringify(targetObject);
    let resultObject = JSON.parse(resultString);
      
    return resultObject.map((v) => {
      var length = v.values.length;
      let initialPrice = v.values[0].close ;
      let totalDailyReturn = 0;
      for(let i = 1 ; i < length ; i++){
        let currentValue = v.values[i];
        let dailyReturn = ((currentValue.close - v.values[i-1].close) / currentValue.close) * 100; // daily return
        totalDailyReturn = totalDailyReturn + dailyReturn;
        v.values[i].daily_return = dailyReturn; // daily return value
        v.values[i].change = ((currentValue.close-initialPrice) / initialPrice) * 100;  // change rate value
      }
      v.average_daily_return = totalDailyReturn / length;
      v.average_return = parseFloat((Math.round((Math.pow(((v.average_daily_return / 100) + 1 ), length) - 1) * 100 * 100)/ 100).toFixed(2));

      return v; 
    });
  }

  public createPieData(targetObject){
    let resultString = JSON.stringify(targetObject);
    let resultObject = JSON.parse(resultString);

    let ukStocks = resultObject.filter(function(v) {
      return v.country_code == "UK"; 
    });

    let usStocks = resultObject.filter(function(v) {
      return v.country_code == "US"; 
    });
    
    let chartObject = [ 
      { "country": "uk", "average_daily_return" : ((parseFloat(ukStocks[0].average_daily_return) + parseFloat(ukStocks[1].average_daily_return)) / 2).toFixed(2), "Group1": 10,"Group2": 10},
      { "country": "us", "average_daily_return" : ((parseFloat(usStocks[0].average_daily_return) + parseFloat(usStocks[1].average_daily_return)) / 2).toFixed(2), "Group1": 10,"Group2": 20}
    ];
    console.log("Chart Object: " + chartObject);
    return chartObject;
  }

  public filterStocks( targetObject, startDate, endDate){
  
    let startDateTime = startDate.setHours(0, 0, 0, 0);
    let endDateTime = endDate.setHours(0, 0, 0, 0);

    // Copy the target object
    let filteredResultString = JSON.stringify(targetObject);
    let filteredResult = JSON.parse(filteredResultString);

    // Filter the result depending on the dates
    filteredResult = filteredResult.map((v) => {
        let filtered = v.values.filter(isBetweenDates);
        v.values = filtered;
        return v;
    })
    
    function isBetweenDates(value) {
      let currentDate = new Date(value.date).setHours(0, 0, 0, 0);
      return (currentDate >= startDateTime && currentDate <= endDateTime);
    }
    
    return filteredResult;
  } 

  public changeFunction(startDate, endDate) {

    let filteredStocks = this.filterStocks(this.processedStocks, startDate, endDate);
    filteredStocks = this.calculateReturn(filteredStocks);
    
    console.log("Filtered Stocks Length: " + filteredStocks[0].values.length);
    console.log("Filtered Stocks Average Return: " + filteredStocks[0].average_return);
    console.log("Filtered Stocks Average Daily Return: " + filteredStocks[0].average_daily_return);

    this.filteredStocks = filteredStocks;
    let pieData = this.createPieData(filteredStocks);

    console.log("Pie Data: " + pieData);

    this.d3Svg.selectAll('.pie')
      .select("text").remove()
      .data(pieData)
      .append("text")
      .attr("dy", ".5em")
      .style("text-anchor", "middle")
      .style("fill", function(d:any,i){return "white";})
      .text(function(d: any) { return d.average_daily_return});
      
  }
  
  public drawPieCharts(){
    
  }
  private initMap(){
    var map =  new Datamap({
      element: document.getElementById('container'),
      projection: 'mercator',
      responsive: true,
      highlightFillColor: 'defaultFill',
      geographyConfig: {
          borderWidth: 0
      },
      fills: {
          defaultFill: "#E6E6E6",
          exists: "#00599C",
          bubble: "#747474"
      },data: {
        USA: { fillKey: "exists" },
        GBR: { fillKey: "exists" }
      }
    });
    map.bubbles([
      {
        name: 'USA',
        radius: 7,
        fillKey: 'bubble',
        borderWidth: 0,
        fillOpacity: 1,
        highlightOnHover: false,
        highlightFillColor: 'bubble',
        highlightBorderColor: 'bubble',
        latitude: 41,
        longitude: -100
      },{
        name: 'GBR',
        radius: 5,
        fillKey: 'bubble',
        centered: 'GBR',
        borderWidth: 0,
        fillOpacity: 1,
        highlightOnHover: false,
        highlightFillColor: 'bubble',
        highlightBorderColor: 'bubble'
      }
    ]);

    map.arc([
      {
          origin: 'USA',
          destination: {
              latitude: 20,
              longitude: -57
          },
          options: {
            strokeWidth: 3,
            strokeColor: '#747474',
            greatArc: true,
            animationSpeed: 1000,
            arcSharpness: 0
          }
      },
      {
          origin: 'GBR',
          destination: {
              latitude: 70,
              longitude: -5
          },
          options: {
            strokeWidth: 3,
            strokeColor: '#747474',
            greatArc: false,
            animationSpeed: 1000,
            arcSharpness: 0
          }
      }
    ],  {strokeWidth: 1, arcSharpness: 1.4});
      return map;
    }
  
    

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    
    var startDate = changes['startDate'] ?  changes['startDate'].currentValue : this.startDate;
    var endDate = changes['endDate'] ?  changes['endDate'].currentValue : this.endDate;
    
    console.log("Start Date: " + startDate);
    console.log("End Date: " + endDate);
    
    if (startDate && ( !changes['startDate'] ||  !changes['startDate'].isFirstChange())
     && endDate && ( !changes['endDate'] ||  !changes['endDate'].isFirstChange())){
      this.changeFunction(startDate, endDate);
    }
    


      /*let result =  this.processedStocks.find(item => {
        return new Date(item.values.date).setHours(0, 0, 0, 0) == newDateTime;
      });*/
    }
}