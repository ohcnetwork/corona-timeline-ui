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
        categories,
        tickmarkPlacement: 'on',
        title: {
          enabled: false
        }
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
        dataLabels: {
          enabled: true
        },
        enableMouseTracking: false
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