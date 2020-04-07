import React, {useState, useEffect, useRef} from 'react';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

export function StackedLine({categories, data = [], chartRef}) {
    const opts = {
      chart: {
        type: 'line'
      },
      title: {
        text: 'World Corona Timeline'
      },
      subtitle: {
        text: 'Source: WHO API'
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
    const [options, setOptions] = useState({});
    useEffect(()=> {
       setOptions({
                ...opts,
                xAxis: {
                ...opts.xAxis,
                categories,
                max: categories.length-1
                },
                series: data
            });
            console.log('propDAta trigr series', data);
    }, [data])
    return (
      <HighchartsReact
        containerProps={{ style: { height: '90vh' } }}
        highcharts={Highcharts}
        options={options}
        ref={chartRef}
      />
    );
}