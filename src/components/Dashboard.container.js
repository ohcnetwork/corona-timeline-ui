import React, { useState, useEffect, useRef } from 'react';

import { Button, Slider } from '@material-ui/core';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import PublicIcon from '@material-ui/icons/Public';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import ToggleButton from '@material-ui/lab/ToggleButton';

import { mapWorldStatToChartSeries, mapIndiaStatToChartSeries, mapToSelectedLocChartSeries } from '../mappers/chart-view.mapper';
import { retrieveCoronaWorldReports, retrieveCoronaIndiaStats } from '../api/corona-reports.data.service';
import { StackedLine } from './StackedLine';
import { ChartSettingsModal} from './ChartSettingsModal';

const initialStackedData = {
  dates: [''],
  locStatMap: {},
};

const retrieveChartSeries = async (mode) => {
  let chartSeries
  if (mode === 'India') {
    const indiaStats = await retrieveCoronaIndiaStats();
    chartSeries = mapIndiaStatToChartSeries(indiaStats);
  } else {
    const worldStats = await retrieveCoronaWorldReports();
    chartSeries = mapWorldStatToChartSeries(worldStats);
  }
  return chartSeries
}
export function Dashboard() {

  const sliderRef = useRef();
  const persistedLocs = localStorage.getItem('selectedLocs');
  const persistedMode = persistedLocs ? localStorage.getItem('selectedMode') : null;

  const [selectedLocs, SetSelectedLocs] = useState(persistedLocs && persistedMode ? persistedLocs.split(',') : ['Delhi', 'Kerala']);
  const [chartSeries, setChartSeries] = useState(initialStackedData);
  const [selectedLocSeries, setSelectedLocSeries] = useState({dates:[], series:[{name:'', data: []}]});
  const [selectedDate, setSelectedDate] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sliderValue, setSliderValue] = useState(1);
  const [isPlayMode, setIsPlayMode] = useState(false);
  const [mode, setMode] = useState(persistedMode ? persistedMode : 'India');
  async function _setChartDataBasedOnMode(tempMode = null) {
    const chartSeries = await retrieveChartSeries(tempMode ? tempMode : mode);
    setChartSeries(chartSeries);
  };
  useEffect(() => {
    async function initiateCoronaStats() {
      const chartSeries = await retrieveChartSeries(mode);
      const selectedLocSeries = mapToSelectedLocChartSeries(
        selectedLocs,
        chartSeries
      );
      setChartSeries(chartSeries);
      setSelectedLocSeries(selectedLocSeries);
      setSelectedDate(selectedLocSeries.dates[0]);
      setIsPlayMode(true);
    }
    initiateCoronaStats();
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
     }, 600);
     if (!isPlayMode || sliderValue === selectedLocSeries?.dates.length) {
       clearInterval(interval);
     }
     return () => clearInterval(interval);
   },[sliderValue, isPlayMode])

  const sliderLabelFormat = (value) => selectedLocSeries.dates[value - 1];

  const onSliderChange =(event, index) => {
    setSliderValue(index);
    setSelectedDate(selectedLocSeries.dates[index - 1]);
  };
  const onModalOpen = () => {
    _setChartDataBasedOnMode();
    setIsSettingsOpen(true); 
    setIsPlayMode(false);
  }
  const onModalClose = () => {
    setIsSettingsOpen(false);
  }
  
  const onApplySettings = ({mode, selectedLocs}) => {
    setIsSettingsOpen(false);
    const selectedLocSeries = mapToSelectedLocChartSeries(
      selectedLocs,
      chartSeries
    );
    setSelectedLocSeries(selectedLocSeries);
    setSelectedDate(chartSeries.dates[0]);
    setSliderValue(1);
    setMode(mode);
    SetSelectedLocs(selectedLocs);
    setIsPlayMode(true);
    localStorage.setItem('selectedMode', mode)
    localStorage.setItem('selectedLocs', selectedLocs);
  }

   return (
     <div className="chart-container">
       <div className="add-countries">
         <Button
          className="add-country-btn"
           onClick={onModalOpen}
           variant="contained"
           color="default"
           endIcon={<PublicIcon></PublicIcon>}
         >
           +
      </Button>
       </div>
       <div className="stacked-line">
         <StackedLine
           categories={selectedLocSeries.dates}
           series={selectedLocSeries.series}
           index={sliderValue}
           mode={mode}
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
                max={selectedLocSeries?.dates?.length}
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
        selectedLocs={selectedLocs}
        locations={Object.keys(chartSeries.locStatMap)}
        onModalClose={onModalClose}
        onApplySettings={onApplySettings}
        onModeChange={(tempMode) => _setChartDataBasedOnMode(tempMode)}
       ></ChartSettingsModal>
     </div> 
   );
}