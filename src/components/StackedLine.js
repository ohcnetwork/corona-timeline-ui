import React, {useState, useEffect, useRef} from 'react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import * as _ from 'lodash';

export function StackedLine({ categories, series, index, mode}) {
  const modeToTitleMap = {
    India: 'India Corona Timeline',
    International: 'World Corona Timeline',
    Kerala: 'Kerala Corona Timeline'
  };
  const chartRef = useRef();
    const opts = {
      chart: {
        type: 'line',
        animation: false
      },
      title: {
        text: 'Corona Timeline'
      },
      subtitle: {
        text: 'Data Pattern'
      },
      xAxis: {
        categories
      },
      yAxis: {
        title: {
          text: 'Counts'
        },
        labels: {
            formatter: function () {
                return this.value;
            }
        }
      },
      tooltip: {
        split: true,
        valueSuffix: ' millions'
      },
      plotOptions: {
        line: {
          dataLabels: {
            enabled: true,
            formatter: function () {
              const last = this.series.data[this.series.data.length - 1];
              if (this.point.category === last.category && this.point.y === last.y) {
                return this.point.y;
              }
              return "";
            }
          },
        },
      },
      series: []
    };

  const _mapDataWithInitialIndex = (countryLookup, index) => {
    return countryLookup.map((stackedLineItem) => {
      return {
        ...stackedLineItem,
        data: _.get(stackedLineItem, 'data', []).slice(0, index),
      };
    })
  }
    const _updateChartSeriesWithNewIndex = (index) => {
      const chartSeries = chartRef.current.chart.series;
      if (_.isEmpty(chartSeries)) {
        return;
      }
      const task = index > chartSeries[0].data.length
        ? { isIndexLess: false, rangeArray: _.range(chartSeries[0].data.length, index) }
        : { isIndexLess: true, rangeArray: _.range(chartSeries[0].data.length, index - 1) };
      // const isAutoRedraw = operation.rangeArray.length < 3;
      const isAutoRedraw = false;
      chartSeries.forEach((_series, i) => {
        if (task.isIndexLess) {
          task.rangeArray.forEach(remIndex => {
            _series.removePoint(remIndex, isAutoRedraw);
          });
          return;
        }
        if (task.rangeArray.length === 1) {
          _series.addPoint([task.rangeArray[0], series[i].data[task.rangeArray[0]]], isAutoRedraw);
          return;
        }
        task.rangeArray.forEach(addIndex => {
          _series.addPoint([addIndex, series[i].data[addIndex]], isAutoRedraw);
        });
      });
      if (!isAutoRedraw) {
        chartRef.current.chart.redraw();
      }
    }
    const [options, setOptions] = useState({});

    useEffect(()=> {
       setOptions({
                ...opts,
                title:{text: modeToTitleMap[mode]},
                xAxis: {
                ...opts.xAxis,
                categories,
                max: categories.length-1
                },
                series: _mapDataWithInitialIndex(series, 1)
            });
    }, [series, mode])

    useEffect(() => {
      _updateChartSeriesWithNewIndex(index);
    }, [index])

    
    return (
      <HighchartsReact
        containerProps={{ style: { height: '90vh' } }}
        highcharts={Highcharts}
        options={options}
        ref={chartRef}
      />
    );
}