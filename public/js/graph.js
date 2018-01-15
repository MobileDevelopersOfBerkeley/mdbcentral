function graphPie(tag, labels, data) {
  Chartist.Pie(tag, {
    labels: labels,
    series: data
  });
}

function graphLine(tag, labels, datas) {
  Chartist.Line(tag, {
    labels: labels,
    series: datas
  }, {
    lineSmooth: false,
    showArea: false,
    height: "245px",
    axisX: {
      showGrid: false,
    },
    lineSmooth: Chartist.Interpolation.simple({
      divisor: 3
    }),
    showLine: true,
    showPoint: true,
  }, [
    ['screen and (max-width: 640px)', {
      axisX: {
        labelInterpolationFnc: function(value) {
          return value[0];
        }
      }
    }]
  ]);
}

function graphBar(tag, labels, datas) {
  Chartist.Bar(tag, {
    labels: labels,
    series: datas
  }, {
    seriesBarDistance: 10,
    axisX: {
      showGrid: false
    },
    height: "245px"
  }, [
    ['screen and (max-width: 640px)', {
      seriesBarDistance: 5,
      axisX: {
        labelInterpolationFnc: function(value) {
          return value[0];
        }
      }
    }]
  ]);
}