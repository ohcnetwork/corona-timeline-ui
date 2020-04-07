import React, { useState, useEffect, useRef } from 'react';
import * as _ from 'lodash';
import Slider from '@material-ui/core/Slider';
import { mapToStackedLineView } from '../mappers/chart-view.mapper';
import { retrieveCoronaWorldReports } from '../api/corona-reports.data.service';
import { StackedLine } from './StackedLine';
import PublicIcon from '@material-ui/icons/Public';
import { Modal, IconButton, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';


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
const style = { width: '95%', 'marginLeft': 60, 'marginTop': 85};

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
     currentData: { Italy: [], Spain: [], China: []},
   });
   const [selectedCountries, setSelectedCountries] = useState(['Spain','Italy']);
   const [chartDataLookup, setChartDataLookup] = useState([[]]);
   const [chartData, setChartData] = useState([]);
   const [selectedDate, setSelectedDate] = useState('');
   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
    //  sliderRef.focus();
     console.log('sliderRef', sliderRef);
       console.log('await call');
   }, []);

  const sliderLabelFormat = (value)  => stackedMapData.categories[value - 1];

  const onSliderChange = _.debounce((event, index) => {
    _updateWithNewIndex(index);
    setSelectedDate(stackedMapData.categories[index - 1]);
  }, 200);
  const onModalClose = () => {
    setIsSettingsOpen(false);
  }
  const onCountriesSelection = (event, countries) => {
    setSelectedCountries(countries);
    const chartDataLookup = _mapToChartData(
      countries,
      stackedMapData.currentData
    );
    setChartDataLookup(chartDataLookup);
    setChartData(_mapToSlidPositionData(chartDataLookup, 1));
    setSelectedDate(stackedMapData.categories[0]);
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
           onClick={() => { setIsSettingsOpen(true) }}
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
       <div style={style}>
         <Slider
           min={0}
           defaultValue={1}
           max={stackedMapData?.categories?.length}
           ref={sliderRef}
           valueLabelDisplay="off"
           onChange={onSliderChange}
           valueLabelFormat={sliderLabelFormat}
         />
       </div>
       <div class="settings-wrap">
         <div className="slider-selected-date">{selectedDate}</div>
       </div>
       <_SettingsModal></_SettingsModal>
     </div>
   );

  function _updateWithNewIndex(index) {
    const chartSeries = chartRef.current.chart.series;
    if (_.isEmpty(chartSeries)) {
      return;
    }
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