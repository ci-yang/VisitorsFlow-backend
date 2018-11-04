$.getJSON('/visitorsFlow/visitors', function (data) {
    // Create the chart
    console.log(data);
    Highcharts.stockChart('container', {
        legend: {
            enabled: true,
            align: 'center',
            backgroundColor: '#FCFFC5',
            borderColor: 'black',
            borderWidth: 2,
            symbolWidth: 16,
            symbolHeight: 16,
            symbolRadius: 5,
            itemStyle:{
                "fontSize": "14px"
            }
        },
        rangeSelector : {
              buttons: [
              { type: 'day', count: 1, text: '1d'},
              { type: 'day', count: 7, text: '1w'},
              { type: 'month', count: 1, text: '1m'},
              { type: 'month', count: 3, text: '3m'},
              { type: 'all', text: 'All'}
              ],
              selected : 5
          },

        title : {
            text : ''
        },
        global: {
            useUTC: false
        },
        credits: {
            enabled: false
        },
        /*
        exporting: {
            enabled: false
        },
        navigator: {
            enabled: false
        },
        scrollbar: {
            enabled: false
        },
        */
        series: [{
            name: 'In',
            data: data.highChartDataIn,
            tooltip: {
                valueDecimals: 2
            }
        },{
            name: 'Out',
            data: data.highChartDataOut,
            tooltip: {
                valueDecimals: 2
            }
        }]
    });
});
Highcharts.setOptions({
    global: {
        useUTC: false
    }
})
