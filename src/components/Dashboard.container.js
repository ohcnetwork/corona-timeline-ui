import React, { useState, useEffect, useRef } from 'react';
import * as _ from 'lodash';
import Slider from '@material-ui/core/Slider';
import { mapToStackedLineView } from '../mappers/chart-view.mapper';
import { retrieveCoronaWorldReports } from '../api/corona-reports.data.service';
import { StackedLine } from './StackedLine';

const _mapToChartData = (selectedCountries, countryLookup) => {
  const countryData = _.merge(_.map(selectedCountries, (country) => {
    return countryLookup[country];
  }));

  // const sliderLookupData = _.range(countryData[0].data.length).map(index => {
  //    return countryData.map((stackedLineItem) => {
  //     if(stackedLineItem.name === 'other') {
  //       return stackedLineItem;
  //     }
  //      return {
  //        ...stackedLineItem,
  //        data: stackedLineItem.data.slice(0, index),
  //      };
  //    })
  // });
  return countryData;
}
const _mapToSlidPositionData = (countryLookup, index) => {
  return countryLookup.map((stackedLineItem) => {
      if(stackedLineItem.name === 'other') {
        return stackedLineItem;
      }
       return {
         ...stackedLineItem,
         data: stackedLineItem.data.slice(0, index),
       };
     })
}
const style = { width: '95%', 'margin-left': 60, 'margin-top': 70};

export function Dashboard() {
   const [stackedMapData, setStackedMapData] = useState({
     categories: [''],
     currentData: { Italy: [], US: [], Spain: [], China: []},
   });
   const [selectedCountries, setSelectedCountries] = useState(['China','Spain','Italy', 'US']);
   const [chartDataLookup, setChartDataLookup] = useState([[]]);
   const [chartData, setChartData] = useState([]);
   const [selectedDate, setSelectedDate] = useState('');
   const chartRef = useRef();

   useEffect(() => {
       async function retrieveWorldCoronaReports() {
           const reports = await retrieveCoronaWorldReports();
           const stackLineView = mapToStackedLineView(reports);
           const chartDataLookup = _mapToChartData(
             selectedCountries,
             stackLineView.currentData
           );
           setStackedMapData(stackLineView);
           setChartDataLookup(chartDataLookup);
           setChartData(_mapToSlidPositionData(chartDataLookup, 1));
           setSelectedDate(stackedMapData.categories[0]);
       }
       retrieveWorldCoronaReports();
       console.log('await call');
   }, []);
  const sliderLabelFormat = (value)  => stackedMapData.categories[value - 1];
  const onSliderChange = (event, index) => {
    _updateWithNewIndex(index);
    setSelectedDate(stackedMapData.categories[index - 1]);
  }
   return (
     <div className="chart-container">
       <div className="stacked-line">
         <StackedLine
           categories={stackedMapData?.categories}
           data={chartData}
           chartRef={chartRef}
         ></StackedLine>
       </div>
       <div style={style}>
         <Slider
           min={0}
           defaultValue={1}
           max={stackedMapData?.categories?.length}
           valueLabelDisplay="off"
           onChange={onSliderChange}
           valueLabelFormat={sliderLabelFormat}
         />
       </div>
       <div className="slider-selected-date">{selectedDate}</div>
     </div>
   );

  function _updateWithNewIndex(index) {
    const chartSeries = chartRef.current.chart.series;
    console.log(chartSeries);
    const operation = index > chartSeries[0].data.length
      ? { isIndexLess: false, rangeArray: _.range(chartSeries[0].data.length, index) }
      : { isIndexLess: true, rangeArray: _.range(chartSeries[0].data.length, index - 1) };
    console.log('index', index, 'onMarchchange Operation>', operation);
    const isAutoRedraw = operation.rangeArray.length < 3;
    chartSeries.forEach((series, i) => {
      if (operation.isIndexLess) {
        operation.rangeArray.forEach(remIndex => {
          series.removePoint(remIndex, isAutoRedraw);
        });
        return;
      }
      if (operation.rangeArray.length === 1) {
        series.addPoint([operation.rangeArray[0], chartDataLookup[i].data[operation.rangeArray[0]]]);
        return;
      }
      operation.rangeArray.forEach(addIndex => {
        series.addPoint([addIndex, chartDataLookup[i].data[addIndex]], isAutoRedraw);
      });
    });
    if (!isAutoRedraw) {
      chartRef.current.chart.redraw();
    }
  }
}