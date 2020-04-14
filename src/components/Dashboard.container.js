import React, { useState, useEffect, useRef } from 'react';
import * as _ from 'lodash';

import PublicIcon from '@material-ui/icons/Public';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import { Modal, Button, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { makeStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';

import { mapToStackedLineView } from '../mappers/chart-view.mapper';
import { retrieveCoronaWorldReports } from '../api/corona-reports.data.service';
import { StackedLine } from './StackedLine';


const _mapToChartData = (selectedCountries, countryLookup) => {
  const countryData = _.merge(_.map(selectedCountries, (country) => {
    return countryLookup[country];
  }));
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
const style = { width: '95%', 'marginLeft': 10};

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}
const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 600,
    height: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 300,
  },
  noLabel: {
    marginTop: theme.spacing(3),
  },
  root: {
    width: 500,
    '& > * + *': {
      marginTop: theme.spacing(3),
    },
  },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
export function Dashboard() {
   const [stackedMapData, setStackedMapData] = useState({
     categories: [''],
     currentData: { Italy: [], US: [], China: []},
   });
  const persistedCountries = localStorage.getItem('selectedCountries');
  const [selectedCountries, setSelectedCountries] = useState(persistedCountries ? persistedCountries.split(',') : ['US','China']);
   const [chartDataLookup, setChartDataLookup] = useState([[]]);
   const [chartData, setChartData] = useState([]);
   const [selectedDate, setSelectedDate] = useState('');
   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
   const [sliderValue, setSliderValue] = useState(1);
   const [isPlayMode, setIsPlayMode] = useState(true);
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle);

   const chartRef = useRef();
   const sliderRef = useRef();

   useEffect(() => {
       async function retrieveWorldCoronaReports() {
           const reports = await retrieveCoronaWorldReports();
           const stackLineView = mapToStackedLineView(reports);
           setStackedMapData(stackLineView);
           const chartDataLookup = _mapToChartData(
             selectedCountries,
             stackLineView.currentData
           );
           setChartDataLookup(chartDataLookup);
           setChartData(_mapToSlidPositionData(chartDataLookup, 1));
           setSelectedDate(stackedMapData.categories[0]);
       }
       retrieveWorldCoronaReports();
   }, []);
   useEffect(() => {
     console.log('useEffec isPlay', isPlayMode);

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
     if (!isPlayMode || sliderValue === stackedMapData?.categories.length) {
       clearInterval(interval);
     }
     return () => clearInterval(interval);
   },[chartData, sliderValue, isPlayMode])

  const sliderLabelFormat = (value)  => stackedMapData.categories[value - 1];

  const onSliderChange =(event, index) => {
    setSliderValue(index);
    _updateWithNewIndex(index);
    setSelectedDate(stackedMapData.categories[index - 1]);
  };
  const onModalClose = () => {
    setIsSettingsOpen(false);
  }
  const onCountriesSelection = (event, countries) => {
    setSelectedCountries(countries);
    localStorage.setItem('selectedCountries', countries);
    const chartDataLookup = _mapToChartData(
      countries,
      stackedMapData.currentData
    );
    setChartDataLookup(chartDataLookup);
    setChartData(_mapToSlidPositionData(chartDataLookup, 1));
    setSelectedDate(stackedMapData.categories[0]);
    setSliderValue(1);
  };
  
   const _SettingsModal = () => {
    return <Modal
       open={isSettingsOpen}
       onClose={onModalClose}
       aria-labelledby="simple-modal-title"
       aria-describedby="simple-modal-description"
     >
      <div style={modalStyle} className={classes.paper}>
       <Tags></Tags>
       </div>
     </Modal>
   }

  function Tags() {
    const classes = useStyles();

    return (
      <div className={classes.root}>
        <Autocomplete
          multiple
          id="tags-standard"
          options={Object.keys(stackedMapData.currentData)}
          getOptionLabel={(option) => option}
          defaultValue={selectedCountries}
          onChange={onCountriesSelection}
          autoHighlight={true}
          openOnFocus={true}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              label="Select Countries"
              placeholder="Countries"
            />
          )}
        />
      </div>
     )
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
           categories={stackedMapData?.categories}
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
            <div style={style}>
              <Slider
                min={0}
                value={sliderValue}
                defaultValue={1}
                max={stackedMapData?.categories?.length}
                ref={sliderRef}
                valueLabelDisplay="off"
                onChange={onSliderChange}
                valueLabelFormat={sliderLabelFormat}
              />
            </div>
            <div className="slider-selected-date">{selectedDate}</div>
          </div>
       </div>
       <_SettingsModal></_SettingsModal>
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