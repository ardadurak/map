import { Stocks } from '../shared';

import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';


import {
  D3Service,
  D3,
  Axis,
  BrushBehavior,
  BrushSelection,
  D3BrushEvent,
  ScaleLinear,
  ScaleOrdinal,
  Selection,
  Transition
} from 'd3-ng2-service';

import * as Datamap from 'datamaps';

@Component({
  selector: 'app-datamap',
  template: `
    <div id="container" style="position: relative; width: 500px; height: 500px;"></div>
  `
})

export class DatamapComponent implements OnInit, OnDestroy {

  private d3: D3;
  private parentNativeElement: any;
  private d3Svg: Selection<SVGSVGElement, any, null, undefined>;

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
    var map = new Datamap({

        element: document.getElementById('container'),
        projection: 'mercator',
        responsive: true,
        fills: {
            defaultFill: "#E6E6E6",
            exists: "#00599C"
        },data: {
          USA: { fillKey: "exists" },
          GBR: { fillKey: "exists" }
        }
       });
       map.bubbles([
        {
          name: 'Not a bomb',
          radius: 15,
          yeild: 0,
          country: 'USA',
          centered: 'USA',
          date: '1986-06-05',
          significance: 'Centered on US',
          fillKey: 'USA'
        },
        {
          name: 'Not a bomb',
          radius: 15,
          yeild: 0,
          country: 'USA',
          centered: 'USA',
          date: '1986-06-05',
          significance: 'Centered on US',
          fillKey: 'USA'
        },
      ], {
        popupTemplate: function(geo, data) {
          return '<div class="hoverinfo">Yield:' + data.yeild + 'Exploded on ' + data.date + ' by the '  + data.country + ''
        }
      });


  }
}