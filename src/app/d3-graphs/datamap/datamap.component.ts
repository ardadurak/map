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
  private xFactorUk: number;
  private yFactorUk: number;
  private xFactorUs: number;
  private yFactorUs: number;

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
    const xFactorUk = this.xFactorUk = 0.4859626225320041, yFactorUk = this.yFactorUk = 0.16291388766840606;
    const xFactorUs = this.xFactorUs = 0.3795136671202318, yFactorUs = this.yFactorUs = 0.608870085225356;
    let map = this.initMap();
    let relocate = this.relocateComponents;
    let pieData : any;
    let processedStocks : any;
    

    processedStocks = this.processedStocks = this.processCalculations(Stocks);
    pieData = this.createPieData(processedStocks);
    
    d3ParentElement = d3.select(this.parentNativeElement);
    d3Svg = this.d3Svg = d3ParentElement.select<SVGSVGElement>('svg');

    this.drawPieCharts(pieData);
  
    window.addEventListener('resize', function(event){
      //map.resize();
      //relocate();
    });     
  }

  public relocateComponents(){
    let d3Svg = this.d3Svg;
    let svgWidth = parseFloat( d3Svg.style("width"));
    let svgHeight = parseFloat(d3Svg.style('height'));
    let xUk = svgWidth * this.xFactorUk, xUs = svgWidth * this.xFactorUs;
    let yUk = svgHeight * this.yFactorUk, yUs = svgHeight * this.yFactorUs;
    
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

  public calculateReturn(targetObject){
    // Copy the target object
    let resultString = JSON.stringify(targetObject);
    let resultObject = JSON.parse(resultString);

    return resultObject.map((v) => {
      var length = v.values.length;
      let initialPrice = v.values[0].close ;
      let totalDailyReturn = 0;
      let totalVolume = 0;
      for(let i = 1 ; i < length ; i++){
        let currentValue = v.values[i];
        totalDailyReturn = totalDailyReturn + currentValue.daily_return;
        totalVolume = totalVolume + parseFloat(currentValue.volume);
        v.values[i].change = ((currentValue.close-initialPrice) / initialPrice) * 100;  // change rate value
      }
      v.average_daily_return = totalDailyReturn / length;
      v.average_volume = totalVolume / length;
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
      let totalVolume = 0;
      for(let i = 1 ; i < length ; i++){
        let currentValue = v.values[i];
        let dailyReturn = ((currentValue.close - v.values[i-1].close) / currentValue.close) * 100; // daily return
        totalDailyReturn = totalDailyReturn + dailyReturn;
        v.values[i].daily_return = dailyReturn; // daily return value
         totalVolume = totalVolume + parseFloat(currentValue.volume);
        v.values[i].change = ((currentValue.close-initialPrice) / initialPrice) * 100;  // change rate value
      }
      v.average_daily_return = totalDailyReturn / length;
      v.average_volume = totalVolume / length;
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

    /*function createObject(target){

    }
*/
    let chartObject = [ 
      { 
        "country": "uk", 
        "averageDailyReturn" : ((parseFloat(ukStocks[0].average_daily_return) + parseFloat(ukStocks[1].average_daily_return)) / 2).toFixed(2), 
        "data" :[
          {
            "name": ukStocks[0].name,
            "value": ukStocks[0].values[ukStocks.length-1].close
          },
          {
            "name": ukStocks[1].name,
            "value": ukStocks[1].values[ukStocks.length-1].close
          },
        ]
      },
      { 
        "country": "us", 
        "averageDailyReturn" : ((parseFloat(usStocks[0].average_daily_return) + parseFloat(usStocks[1].average_daily_return)) / 2).toFixed(2), 
        "data" :[
          {
            "name": usStocks[0].name,
            "value": usStocks[0].values[usStocks.length-1].close
          },
          {
            "name": usStocks[1].name,
            "value": usStocks[1].values[usStocks.length-1].close
          },
        ]
      }
     ];
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
    this.filteredStocks = filteredStocks;
    let pieData = this.createPieData(filteredStocks);
    let d3Svg = this.d3Svg;
    let d3 = this.d3;
    /*
    console.log("Filtered Stocks Length: " + filteredStocks[0].values.length);
    console.log("Filtered Stocks Average Return: " + filteredStocks[0].average_return);
    console.log("Filtered Stocks Average Daily Return: " + filteredStocks[0].average_daily_return);
    console.log("Pie Data: " + pieData);
    */
    /*
    d3Svg.selectAll('.pie-uk').select('text').text(pieData[0].averageDailyReturn); // winner
    d3Svg.selectAll('.pie-us').select('text').text(pieData[1].averageDailyReturn); // winner
   */
/*
    let arc : any= d3.arc()
      .outerRadius(40)
      .innerRadius(20);

    let pie = d3.pie()
      .value(function(d: any){ debugger; return d.value });
    debugger;
    d3.selectAll('.pie-uk')
      .data(pieData)

    let path = d3.selectAll('.pie-uk').selectAll('.path')
      .data(function(d: any){debugger;
         return pie(d.data[0]) });

    path.attr("d", arc);
*/
    let arc : any= d3.arc()
      .outerRadius(40)
      .innerRadius(20);

    let pie = d3.pie()
      .value(function(d: any){ return d.value });
    let theData = pieData[0];
/*
    d3Svg
      .selectAll('.pie-uk')
      .data(theData.data)
      .selectAll('.slice')
      .data(function(d: any){
        debugger;
         return pie([d.data[0], d.data[1]]) })
      .selectAll('path')
      .attr('d',  arc);*/
    
   
/*
     
				 path = path.data(pie(frequency)); // update the data
				  path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
			function arcTween(a) {
			  var i = d3.interpolate(this._current, a);
			  this._current = i(0);
			  return function(t) {
			    return arc(i(t));
			  };
			}
     
     */ 
  }
  
  public drawCircles(){
    this.d3Svg.append("circle")
      .attr("r", 50)
      .attr("fill", '#747474')
      .attr('class', 'circle-uk');
    
    this.d3Svg.append("circle")
      .attr("r", 50)
      .attr("fill",  '#747474')
      .attr('class', 'circle-us');
  }

  public drawPieCharts(pieData){

    this.d3Svg.selectAll('.pie').remove();
    let d3 = this.d3;
    let d3Svg = this.d3Svg;
    let color = d3.scaleOrdinal(d3.schemeCategory10);
    this.drawCircles();

    var arc : any= d3.arc()
       .innerRadius(20).outerRadius(40);
    var labelArc : any= d3.arc()
       .innerRadius(55).outerRadius(55);

    var pie = d3.pie()
      .value(function(d: any){ return d.value });
 
    var pies = d3Svg.selectAll('.pie')
      .data(pieData)
      .enter()
      .append<SVGGElement>('g')
      .attr('class', 'pie')
      .attr('class', function(d: any){ return 'pie-' + d.country})
    
    pies
      .append("text")
      .attr("dy", ".5em")
      .style("text-anchor", "middle")
      .style("fill", "white")
      .text(function(d: any) { return d.averageDailyReturn})
    
    pies.selectAll('.slice')
      .data(function(d: any){
         return pie([d.data[0], d.data[1]]) })
      .enter()
      .append<SVGGElement>('path')
      .attr('d',  arc)
      .attr('cursor', 'pointer')
      .style('fill', function(d,i: any){
        return color(i);
      })

    pies.selectAll('.slice')
      .data(function(d: any){
         return pie([d.data[0], d.data[1]]) })
      .enter()    
      .append("text")
	    .text(function(d: any) { return d.data.name;})	
      .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
	    .style("fill", "black");

      this.relocateComponents();
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
  }
}