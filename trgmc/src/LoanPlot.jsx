import { Chart } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, BarController, LineController, Title, Tooltip, PointElement, LineElement } from "chart.js"; //Legend
ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, PointElement, LineElement, LineController); //Legend
import { useState } from "react";

// ChartJS.register(
//   LinearScale,
//   CategoryScale,
//   BarElement,
//   PointElement,
//   LineElement,
//   Legend,
//   Tooltip,
//   LineController,
//   BarController
// );

function LoanPlot({ maxMonthly, loanRes, loanMonths, propertyTax, hoa, insurance, startDate }) {
  const [monthsPerYearToPlot, setMonthsPerYearToPlot] = useState("yearly payments");
  const indexPlot = monthsPerYearToPlot == "monthly payments" ? 1 : 12;
  const yTitle = monthsPerYearToPlot == "monthly payments" ? "Monthly Payments" : "Yearly Payments";
  const startMonth = startDate.getMonth();
  // console.log(startDate, startMonth)

  // console.log('rem',loanRes["remaining"])
  var monthlyPrincipalFiltered;
  var monthlyInterestFiltered;
  var loanMonthsFiltered;
  var remainingFiltered;

  if (monthsPerYearToPlot == "monthly payments") {
    loanMonthsFiltered = loanMonths;
    monthlyPrincipalFiltered = loanRes["monthlyPrincipal"];
    monthlyInterestFiltered = loanRes["monthlyInterest"];
    remainingFiltered = loanRes["remaining"];
  } else {
    // var loanMonthsFiltered = [0]
    monthlyPrincipalFiltered = [0];
    monthlyInterestFiltered = [0];
    // var remainingFiltered = [0]

    var loanMonthsFiltered_full = loanMonths.filter(function (element, index) {
      return index % 12 === 0;
    });
    loanMonthsFiltered = loanMonthsFiltered_full.map((d) => d.substring(4, 8));
    remainingFiltered = loanRes["remaining"].filter(function (element, index) {
      return index % indexPlot === 0;
    });

    for (var i = 0; i < loanMonths.length; i++) {
      var yearIndex = Math.floor((startMonth + i) / 12);
      // console.log(yearIndex)
      // if ((yearIndex==0) || (i==0)) {
      //   monthlyPrincipalFiltered.push(0);// = 0
      //   monthlyInterestFiltered[yearIndex] = 0
      // }
      if (yearIndex >= monthlyPrincipalFiltered.length) monthlyPrincipalFiltered.push(0);
      if (yearIndex >= monthlyInterestFiltered.length) monthlyInterestFiltered.push(0);
      monthlyPrincipalFiltered[yearIndex] = monthlyPrincipalFiltered[yearIndex] + loanRes["monthlyPrincipal"][i];
      monthlyInterestFiltered[yearIndex] = monthlyInterestFiltered[yearIndex] + loanRes["monthlyInterest"][i];
    }
    // console.log(yearIndex, loanRes["monthlyPrincipal"], loanRes["monthlyInterest"])

    // var monthlyPrincipalFiltered = loanRes["monthlyPrincipal"].filter(function (element, index) {
    //   return index % indexPlot === 0;
    // });
    // var monthlyInterestFiltered = loanRes["monthlyInterest"].filter(function (element, index) {
    //   return index % indexPlot === 0;
    // });
  }

  const DEFAULT_PLOTLY_COLORS = [
    "rgba(31, 119, 180, 0.6)",
    "rgba(255, 127, 14, 0.6)",
    "rgba(44, 160, 44, 0.6)",
    "rgba(214, 39, 40, 0.6)",
    "rgba(148, 103, 189, 0.6)",
    "rgba(140, 86, 75, 0.6)",
    "rgba(227, 119, 194, 0.6)",
    "rgba(127, 127, 127, 0.6)",
    "rgba(188, 189, 34, 0.6)",
    "rgba(23, 190, 207, 0.6)",
  ];

  var data = {
    labels: loanMonthsFiltered,
    datasets: [
      {
        type: "bar",
        label: "Interest",
        data: monthlyInterestFiltered,
        backgroundColor: DEFAULT_PLOTLY_COLORS[0],
        hoverBackgroundColor: "rgba(0, 0, 0, 1.0)",
        barPercentage: 1.0,
        categoryPercentage: 1.0,
        borderWidth: 0,
        order: 3,
        xAxisID: "x",
      },
      {
        type: "bar",
        label: "Principal",
        data: monthlyPrincipalFiltered,
        backgroundColor: DEFAULT_PLOTLY_COLORS[1],
        hoverBackgroundColor: "rgba(0, 0, 0, 1.0)",
        barPercentage: 1.0,
        categoryPercentage: 1.0,
        borderWidth: 0,
        order: 2,
        xAxisID: "x",
      },
      {
        type: "line",
        label: "Remaining Balance",
        data: remainingFiltered,
        order: 1,
        xAxisID: "x1",
      },
    ],
  };

  var title = ["Tax", "HoA", "Insurance"];
  [propertyTax, hoa, insurance].forEach((x, i) => {
    if (x > 0) {
      // console.log('test', x)
      var plotable = [];
      for (var z = 0; z < loanMonthsFiltered.length; z++) plotable.push(x);
      data.datasets.push({
        type: "bar",
        label: title[i],
        data: plotable,
        backgroundColor: DEFAULT_PLOTLY_COLORS[2 + i],
        hoverBackgroundColor: "rgba(0, 0, 0, 1.0)",
        barPercentage: 1.0,
        categoryPercentage: 1.0,
        borderWidth: 0,
        order: 4 + i,
        xAxisID: "x",
      });
    }
  });

  var options = {
    indexAxis: "y",
    maintainAspectRatio: false,
    scales: {
      x: {
        max: Math.round(maxMonthly),
        position: "top",
        stacked: true,
        grid: { display: false },
        ticks: {
          // minRotation: 20,
          // Include a dollar sign in the ticks
          callback: function (value) {
            return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value);

            // return '$' + value;
          },
        },
        title: { text: yTitle, display: true },
      },
      x1: {
        ticks: {
          // minRotation: 20,
          // Include a dollar sign in the ticks
          callback: function (value) {
            return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value);

            // return '$' + value;
          },
        },
        title: { text: "Remaining Balance", display: true },
      },

      y: {
        stacked: true,
        grid: { display: false },
      },
    },
    interaction: {
      mode: "index",
    },
    plugins: {
      // legend: {
      //   position: "bottom",
      // },
      tooltip: {
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 16,
        },
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";

            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(context.parsed.x);
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="row shadow-sm border rounded my-2 py-1 mx-0 px-1">
      <div className="col-12 px-0">
        <div className="row mx-0">
          <div className="col-12 px-0">
            <div className="plotHeight">
              <Chart type="bar" data={data} options={options} />
            </div>
          </div>
        </div>

        <div className="row mx-0">
          <div className="col-12 px-0">
            <div className="input-group ">
              <span className="pe-3">Show: </span>
              {["monthly payments", "yearly payments"].map((x) => (
                <div className="form-check form-check-inline" key={x}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="numMonPlot"
                    checked={monthsPerYearToPlot == x}
                    value={x}
                    onChange={() => setMonthsPerYearToPlot(x)}
                  />
                  <label className="form-check-label">{x}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanPlot;
