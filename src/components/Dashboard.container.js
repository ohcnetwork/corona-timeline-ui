import React, { useState, useEffect, useRef } from 'react';

import { Button, TextField, Slider } from '@material-ui/core';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import PublicIcon from '@material-ui/icons/Public';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import ToggleButton from '@material-ui/lab/ToggleButton';
import * as _ from 'lodash';

import { mapWorldStatToChartSeries, mapIndiaStatToChartSeries, mapToSelectedChartSeries } from '../mappers/chart-view.mapper';
import { retrieveCoronaWorldReports, retrieveCoronaIndiaStats } from '../api/corona-reports.data.service';
import { StackedLine } from './StackedLine';
import { ChartSettingsModal} from './ChartSettingsModal';

const _mapDataWithSliderPosition = (countryLookup, index) => {
  return countryLookup.map((stackedLineItem) => {
       return {
         ...stackedLineItem,
         data: stackedLineItem.data.slice(0, index),
       };
     })
}
const initialStackedData = {
  dates: [''],
  placeStatMap: {},
};
export function Dashboard() {

  const chartRef = useRef();
  const sliderRef = useRef();
  const persistedCountries = localStorage.getItem('selectedCountries');
  const persistedMode = persistedCountries ? localStorage.getItem('selectedMode') : null;

  const [selectedCountries, setSelectedCountries] = useState(persistedCountries && persistedMode ? persistedCountries.split(',') : ['Delhi', 'Kerala']);
  const [chartSeries, setChartSeries] = useState(initialStackedData);
  const [chartDataLookup, setChartDataLookup] = useState([[]]);
  const [chartData, setChartData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sliderValue, setSliderValue] = useState(1);
  const [isPlayMode, setIsPlayMode] = useState(true);
  const [mode, setMode] = useState(persistedMode ? persistedMode : 'India');

  const chartDataBasedOnMode = async() => {
    let chartSeries
        if(mode === 'India') {
          const indiaStats = await retrieveCoronaIndiaStats();
          chartSeries = mapIndiaStatToChartSeries(indiaStats);
          setChartSeries(chartSeries);
        } else {
          const worldStats = await retrieveCoronaWorldReports();
          chartSeries = mapWorldStatToChartSeries(worldStats);
          setChartSeries(chartSeries);
        }
        return chartSeries
   }
   useEffect(() => {
     async function _setChartDataBasedOnMode() {
       await chartDataBasedOnMode();
     };
     _setChartDataBasedOnMode();
   }, [mode])

   useEffect(() => {
       async function retrieveWorldCoronaReports() {
           const chartSeries = await chartDataBasedOnMode();
           const chartDataLookup = mapToSelectedChartSeries(
             selectedCountries,
             chartSeries.placeStatMap
           );
           setChartDataLookup(chartDataLookup);
           setChartData(_mapDataWithSliderPosition(chartDataLookup, 1));
           setSelectedDate(chartSeries.dates[0]);
       }
       retrieveWorldCoronaReports();
   }, []);
   
   // animation play and pause
   useEffect(() => {
     let interval;
     if (!isPlayMode) {
       clearInterval(interval);
       return;
     }
     interval = setInterval(() => {
       const newValue = sliderValue + 1;
       setSliderValue(newValue);
       onSliderChange(null, newValue);
       console.log('setInterval')
     }, 600);
     if (!isPlayMode || sliderValue === chartSeries?.dates.length) {
       clearInterval(interval);
     }
     return () => clearInterval(interval);
   },[chartData, sliderValue, isPlayMode])

  const sliderLabelFormat = (value)  => chartSeries.dates[value - 1];

  const onSliderChange =(event, index) => {
    setSliderValue(index);
    _updateWithNewIndex(index);
    setSelectedDate(chartSeries.dates[index - 1]);
  };
  const onModalClose = () => {
    setIsSettingsOpen(false);
  }
  const onCountriesSelection = (event, countries) => {
    setSelectedCountries(countries);
    localStorage.setItem('selectedCountries', countries);
    const chartDataLookup = mapToSelectedChartSeries(
      countries,
      chartSeries.placeStatMap
    );
    setChartDataLookup(chartDataLookup);
    setChartData(_mapDataWithSliderPosition(chartDataLookup, 1));
    setSelectedDate(chartSeries.dates[0]);
    setSliderValue(1);
  };
  const  onModeSelection =(event) => {
    setSelectedCountries([]);
    setSelectedDate('');
    setSliderValue(1);
    setChartSeries(initialStackedData);
    setChartData([]);
    setMode(event.target.value);
    localStorage.setItem('selectedMode', event.target.value);
    localStorage.setItem('selectedCountries', '');
  }

   return (
     <div className="chart-container">
       <div className="add-countries">
         <Button
          className="add-country-btn"
           onClick={() => { setIsSettingsOpen(true); setIsPlayMode(false); }}
           variant="contained"
           color="default"
           endIcon={<PublicIcon></PublicIcon>}
         >
           +
      </Button>
       </div>
       <div className="stacked-line">
         <StackedLine
           categories={chartSeries?.dates}
           data={chartData}
           chartRef={chartRef}
         ></StackedLine>
       </div>
       <div className="footer">
         <div className="play-pause">
           <ToggleButtonGroup
             value={isPlayMode}
             exclusive
             onChange={(e, v) => setIsPlayMode(v)}
             aria-label="text alignment"
           >
             <ToggleButton value={true} aria-label="play">
               <PlayArrowIcon />
             </ToggleButton>
             <ToggleButton value={false} aria-label="play">
               <PauseIcon />
             </ToggleButton>
           </ToggleButtonGroup>
         </div>
         <div className="slider-with-date">
           <div style={{ width: '95%', 'marginLeft': 10 }}>
              <Slider
                min={0}
                value={sliderValue}
                defaultValue={1}
                max={chartSeries?.dates?.length}
                ref={sliderRef}
                valueLabelDisplay="off"
                onChange={onSliderChange}
                valueLabelFormat={sliderLabelFormat}
              />
            </div>
            <div className="slider-selected-date">{selectedDate}</div>
          </div>
       </div>
       <ChartSettingsModal
        mode={mode}
        isModalOpen={isSettingsOpen}
        placeStatMap={chartSeries.placeStatMap}
        selectedCountries={selectedCountries}
        onModeSelection={onModeSelection}
        onModalClose={onModalClose}
        onCountriesSelection={onCountriesSelection}
       ></ChartSettingsModal>
     </div>
     
   );

  function _updateWithNewIndex(index) {
    const chartSeries = chartRef.current.chart.series;
    if (_.isEmpty(chartSeries)) {
      return;
    }
    const operation = index > chartSeries[0].data.length
      ? { isIndexLess: false, rangeArray: _.range(chartSeries[0].data.length, index) }
      : { isIndexLess: true, rangeArray: _.range(chartSeries[0].data.length, index - 1) };
    // const isAutoRedraw = operation.rangeArray.length < 3;
    const isAutoRedraw = false;
    chartSeries.forEach((series, i) => {
      if (operation.isIndexLess) {
        operation.rangeArray.forEach(remIndex => {
          series.removePoint(remIndex, isAutoRedraw);
        });
        return;
      }
      if (operation.rangeArray.length === 1) {
        series.addPoint([operation.rangeArray[0], chartDataLookup[i].data[operation.rangeArray[0]]], isAutoRedraw);
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