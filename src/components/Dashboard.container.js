import React, { useState, useEffect, useRef } from 'react';
import * as _ from 'lodash';
import 'rc-slider/assets/index.css';
import Slider, { Handle } from 'rc-slider';
import Tooltip from 'rc-tooltip';
import { mapToStackedLineView } from '../mappers/chart-view.mapper';
import { retrieveCoronaWorldReports } from '../api/corona-reports.data.service';
import { StackedLine } from './StackedLine';

const _mapToChartData = (selectedCountries, countryLookup) => {
  const countryData = _.merge(_.map(selectedCountries, (country) => {
    return countryLookup[country];
  }));

  const sliderLookupData = _.range(countryData[0].data.length).map(index => {
     return countryData.map((stackedLineItem) => {
      if(stackedLineItem.name === 'other') {
        return stackedLineItem;
      }
       return {
         ...stackedLineItem,
         data: stackedLineItem.data.slice(0, index),
       };
     })
  });
  return sliderLookupData;
}
const style = { width: '95%', margin: 60 };

export function Dashboard() {
   const [stackedMapData, setStackedMapData] = useState({
     categories: [''],
     currentData: { Italy: [], US: [], Spain: [], China: [], other: [] },
   });
   const [selectedCountries, setSelectedCountries] = useState(['China','Spain','Italy', 'US', 'other']);
   const [chartDataLookup, setChartDataLookup] = useState([[]]);
   const [chartData, setChartData] = useState([]);
   const [sliderMarks, setSliderMarks] = useState({});
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
           setChartData(chartDataLookup[stackLineView.categories.length-1]);
       }
       retrieveWorldCoronaReports();
       console.log('await call');
   }, []);
  
const onMarkChange = _.debounce((index) => {
  console.log('onMarchchange');
  index < stackedMapData.categories.length &&  setChartData(chartDataLookup[index]);
},250)
const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={stackedMapData.categories[value - 1]}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
};
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
           handle={handle}
           max={stackedMapData?.categories?.length}
           onChange={onMarkChange}
         />
       </div>
     </div>
   );
}