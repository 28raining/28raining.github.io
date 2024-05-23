import { useState } from "react";

function LoanForm({
  displayState,
  flash,
  userSetDownPercent,
  updateUserInput,
  valid
}) {
  // console.log("displayState", displayState, displayState["monthlyPayment"].length)

  const feeOptions = ["$ / year", "$ / month", "% / year", "% / month"];
  const loanAmount = displayState["loanAmount"];
  // const homeVal = parseFloat(loanAmount) + parseFloat(downPayCash);
  // const downPayPercent = 100 * parseFloat(downPayCash) / parseFloat(homeVal);

  // const taxUnitScaler = (displayState['propertyTaxUnit'] == 0) ? 1/12 :
  //                       (displayState['propertyTaxUnit'] == 1) ? 1 :
  //                       (displayState['propertyTaxUnit'] == 2) ? 0.01 / 12 :
  //                       (displayState['propertyTaxUnit'] == 3) ? 0.01 : 0;
  // console.log("flash", flash);
  // function unitScaler(u) {
  //   return u == 0 ? 1 / 12 : u == 1 ? 1 : u == 2 ? (homeVal * 0.01) / 12 : u == 3 ? homeVal * 0.01 : 0;
  // }

  // setAdditionalMonthly(displayState['hoa']*unitScaler(displayState['hoaUnit']) + displayState['propertyTax']*unitScaler(displayState['propertyTaxUnit']) + displayState['insurance']*unitScaler(displayState['insuranceUnit']))

  // function updateHomeVal(newHomeVal) {
  //   setChosenInput("house_value");
  //   var newDownPayCash;
  //   if (userSetDownPercent) {
  //     newDownPayCash = (newHomeVal * downPayPercent) / 100;
  //     setDownPayCash(newDownPayCash);
  //   } else {
  //     newDownPayCash = downPayCash;
  //     setDownPayPercent(((100 * downPayCash) / newHomeVal).toFixed(2));
  //   }
  //   // setHomeVal(newHomeVal);
  //   console.log(newHomeVal, newDownPayCash);
  //   setLoanAmount(newHomeVal - newDownPayCash);
  // }

  // function updateDownPayCash(newV) {
  //   console.log(newV);
  //   setUserSetDownPercent(false);
  //   setDownPayPercent(((100 * newV) / homeVal).toFixed(2));
  //   setDownPayCash(newV);
  //   setLoanAmount(parseFloat(homeVal) - parseFloat(newV));
  //   console.log("bp - a", homeVal, newV);
  // }

  // function updateDownPayPercent(newV) {
  //   setChosenInput("house_value");
  //   console.log("bp - b", newV);
  //   setUserSetDownPercent(true);
  //   var newCash = (homeVal * parseFloat(newV)) / 100;
  //   setDownPayCash(newCash);
  //   setDownPayPercent(newV);
  //   setLoanAmount(homeVal - newCash);
  // }
  const class_validHomeVal = valid.homeVal === null ? null : "is-invalid";
  const class_validMontly = valid.monthlyPayment === null ? null : "is-invalid";

//  console.log("displayState", displayState)
  return (
    <div>
      <div className="row shadow-sm border rounded my-2 py-2 mx-0">
        <div className="col-12 pb-2">
          <div className="row">
            <div className="col-5 pe-0">
              <label>Home Value</label>
              <input
                // key={homeVal}
                type="text"
                className={flash['homeVal'] ? `form-control anim1 ${class_validHomeVal}` : `form-control anim2 ${class_validHomeVal}`}
                value={displayState["homeVal"].length == "" ? "" : new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                  minimumFractionDigits: 0,
                  minimumIntegerDigits: displayState["homeVal"].length,
                }).format(displayState["homeVal"])}
                onChange={(e) => {
                  updateUserInput("homeVal", e.target.value.replace(/[^0-9.-]+/g, ""))  //FIXME - do parse-int inside updateUserInput?
                  // updateHomeVal(parseInt(e.target.value.replace(/[^0-9.-]+/g, "")));
                }}
              />
              {valid.homeVal === null ? null :
              <div className="invalid-feedback" style={{ display: "initial" }}>
                {valid.homeVal}
              </div>}
            </div>
            <div className="col-2 text-center align-self-center">or</div>
            <div className="col-5 ps-0">
              <label>Monthly Payment</label>
              <input
                type="text"
                className={flash['monthly'] ? `form-control anim1 ${class_validMontly}` : `form-control anim2 ${class_validMontly}`}
                onChange={(e) => {
                  updateUserInput("monthly", e.target.value.replace(/[^0-9.-]+/g, ""))
                  // setMonthlyPaymentInput(e.target.value.replace(/[^0-9.-]+/g, ""));
                }}
                value={new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                  minimumFractionDigits: 0,
                  // minimumIntegerDigits: displayState["monthlyPayment"].length,
                }).format(displayState["monthlyPayment"])}
              />
                            {valid.monthlyPayment === null ? null :
              <div className="invalid-feedback" style={{ display: "initial" }}>
                {valid.monthlyPayment}
              </div>}
            </div>
          </div>
        </div>
      </div>
      <div className="row shadow-sm border rounded my-2 py-2 mx-0">
        <div className="col-12">
          <div className="row">
            <div className="col-xl-6 col-12">
              <label>Down Payment</label>

              <div className="input-group mb-1">
                <input
                  type="text"
                  className={userSetDownPercent ? flash['downPay'] ? "form-control anim1" : "form-control anim2" : "form-control"}
                  style={{ width: "70px" }}
                  value={new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                    minimumFractionDigits: 0,
                    minimumIntegerDigits: displayState["downPayCash"].length,
                  }).format(displayState["downPayCash"])}
                  onChange={(e) => {
                    updateUserInput("downPayCash", e.target.value.replace(/[^0-9.-]+/g, ""))
                    // updateDownPayCash(e.target.value.replace(/[^0-9.-]+/g, ""));
                  }}
                />
                <span className="input-group-text" id="basic-addon1">
                  or
                </span>
                <input
                  type="text"
                  className={userSetDownPercent ? "form-control" : flash['downPay'] ? "form-control anim1" : "form-control anim2"}
                  value={displayState["downPayPercent"]}
                  onChange={(e) => {
                    updateUserInput("downPayPercent", e.target.value)

                    // updateDownPayPercent(e.target.value);
                  }}
                />
                <span className="input-group-text" id="basic-addon1">
                  %
                </span>
              </div>
            </div>
            <div className="col-xl-6 col-12">
              <label>Loan Amount</label>

              <input
                type="text"
                className={flash['loanAmount'] ? "form-control anim1" : "form-control anim2"}
                value={new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                  minimumFractionDigits: 0,
                  minimumIntegerDigits: loanAmount.length,
                }).format(loanAmount)}
                onChange={(e) => {
                  // console.log("triggered loanAmount Change");
                  updateUserInput("loanAmount", e.target.value.replace(/[^0-9.-]+/g, ""))

                  // setLoanAmount(e.target.value.replace(/[^0-9.-]+/g, ""));
                }}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-xl-6 col-12">
              <label>Interest rate</label>
              <div className="input-group mb-1">
                <input
                  type="text"
                  className="form-control"
                  value={displayState["interestRate"]}
                  onChange={(e) => {
                    updateUserInput("interestRate", e.target.value.replace(/[^0-9.-]+/g, ""))
                    // setInterestRate(e.target.value.replace(/[^0-9.-]+/g, ""));
                  }}
                />
                <span className="input-group-text" id="basic-addon1">
                  %
                </span>
              </div>
            </div>
            <div className="col-xl-6 col-12">
              <label>Loan length</label>
              <div className="input-group mb-1">
                <input
                  type="text"
                  className="form-control"
                  value={displayState["loanLength"]}
                  onChange={(e) => {
                    updateUserInput("loanLength", e.target.value.replace(/[^0-9.-]+/g, ""));
                  }}
                />
                <span className="input-group-text" id="basic-addon1">
                  years
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row shadow-sm border rounded my-2 py-2 mx-0">
        <div className="col-12 px-0">
          <div className="row mx-0">
            <div className="col-xl-6 col-12">
              <label>Property Tax</label>
              <div className="input-group mb-1">
                <input
                  type="text"
                  className="form-control"
                  value={
                    displayState['propertyTaxUnit'] == 0 || displayState['propertyTaxUnit'] == 1
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                          minimumFractionDigits: 0,
                          minimumIntegerDigits: displayState['propertyTax'].length,
                        }).format(displayState['propertyTax'])
                      : displayState['propertyTax'].toFixed(2)
                  }
                  onChange={(e) => {
                    var x = Number(e.target.value.replace(/[^0-9.-]+/g, ""));
                    updateUserInput("propertyTax", x);

                    // setPropertyTax(x);
                    // setAdditionalMonthly(displayState['hoa'] * unitScaler(displayState['hoaUnit']) + x * unitScaler(displayState['propertyTaxUnit']) + displayState['insurance'] * unitScaler(displayState['insuranceUnit']));
                  }}
                />
                <select
                  type="text"
                  className="form-select px-2 input-group-text"
                  value={displayState['propertyTaxUnit']}
                  onChange={(e) => {
                    updateUserInput("propertyTaxUnit", e.target.value);

                    // setPropertyTaxUnit(e.target.value);
                    // setAdditionalMonthly(displayState['hoa'] * unitScaler(displayState['hoaUnit']) + displayState['propertyTax'] * unitScaler(e.target.value) + displayState['insurance'] * unitScaler(displayState['insuranceUnit']));
                  }}
                >
                  {feeOptions.map((x, i) => (
                    <option value={i} key={i}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-xl-6 col-12">
              <label>HoA</label>
              <div className="input-group mb-1">
                <input
                  type="text"
                  className="form-control"
                  value={
                    displayState['hoaUnit'] == 0 || displayState['hoaUnit'] == 1
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                          minimumFractionDigits: 0,
                          minimumIntegerDigits: displayState['hoa'].length,
                        }).format(displayState['hoa'])
                      : displayState['hoa'].toFixed(2)
                  }
                  onChange={(e) => {
                    var x = Number(e.target.value.replace(/[^0-9.-]+/g, ""));
                    updateUserInput("hoa", x);

                    // setHoa(x);
                    // setAdditionalMonthly(x * unitScaler(displayState['hoaUnit']) + displayState['propertyTax'] * unitScaler(displayState['propertyTaxUnit']) + displayState['insurance'] * unitScaler(displayState['insuranceUnit']));
                  }}
                />
                <select
                  type="text"
                  className="form-select px-2 input-group-text"
                  value={displayState['hoaUnit']}
                  onChange={(e) => {
                    updateUserInput("hoaUnit", e.target.value);

                    // setHoaUnit(e.target.value);
                    // setAdditionalMonthly(displayState['hoa'] * unitScaler(e.target.value) + displayState['propertyTax'] * unitScaler(displayState['propertyTaxUnit']) + displayState['insurance'] * unitScaler(displayState['insuranceUnit']));
                  }}
                >
                  {feeOptions.map((x, i) => (
                    <option value={i} key={i}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        <div className="row mx-0">
          <div className="col-xl-6 col-12">
              <label>
                Insurance
              </label>
            <div className="input-group mb-1">
              <input
                type="text"
                className="form-control"
                value={
                  displayState['insuranceUnit'] == 0 || displayState['insuranceUnit'] == 1
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                        minimumFractionDigits: 0,
                        minimumIntegerDigits: displayState['insurance'].length,
                      }).format(displayState['insurance'])
                    : displayState['insurance'].toFixed(2)
                }
                onChange={(e) => {
                  var x = Number(e.target.value.replace(/[^0-9.-]+/g, ""));
                  updateUserInput("insurance", x);

                  // setInsurance(x);
                  // setAdditionalMonthly(displayState['hoa'] * unitScaler(displayState['hoaUnit']) + displayState['propertyTax'] * unitScaler(displayState['propertyTaxUnit']) + x * unitScaler(displayState['insuranceUnit']));
                }}
              />
              <select
                type="text"
                className="form-select px-2 input-group-text"
                value={displayState['insuranceUnit']}
                onChange={(e) => {
                  // setInsuranceUnit(e.target.value);
                  updateUserInput("insuranceUnit", e.target.value);

                  // setAdditionalMonthly(displayState['hoa'] * unitScaler(displayState['hoaUnit']) + displayState['propertyTax'] * unitScaler(displayState['propertyTaxUnit']) + displayState['insurance'] * unitScaler(e.target.value));
                }}
              >
                {feeOptions.map((x, i) => (
                  <option value={i} key={i}>
                    {x}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default LoanForm;
