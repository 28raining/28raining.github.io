import { isNumber } from "./App";

export function cashFormat(val) {
  if (val == "") return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    minimumIntegerDigits: val.length,
  }).format(val);
}

function ValidFbComp({ x }) {
  if (x === null) return null;
  else {
    return (
      <div className="invalid-feedback" style={{ display: "initial" }}>
        {x}
      </div>
    );
  }
}

function LoanForm({ displayState, flash, updateUserInput, valid }) {
  const feeOptions = ["$ / year", "$ / month", "% / year", "% / month"];
  // const loanAmount = displayState["loanAmount"];

  // var validClass = {};
  // for (const i in valid) validClass[i] = valid[i] === null ? null : "is-invalid";
  // const class_validHomeVal = valid.homeVal === null ? null : "is-invalid";
  // const class_validMontly = valid.monthlyPayment === null ? null : "is-invalid";

  //builds class for each input based on flash (whether it changed and should flash) and valid (if user input is valid)
  var inputClass = {};
  for (const i of [
    "homeVal",
    "monthlyPayment",
    "downPayCash",
    "downPayPercent",
    "loanAmount",
    "interestRate",
    "loanLength",
    "propertyTax",
    "hoa",
    "insurance",
  ]) {
    inputClass[i] = "form-control";

    if (i in valid) {
      inputClass[i] += valid[i] === null ? "" : " is-invalid";
      // validFb = valid[i] === null ? null :
      //   <div className="invalid-feedback" style={{ display: "initial" }}>
      //     {valid[i]}
      //   </div>
    } else console.log(`${i} missing from valid`);

    if (i in flash) inputClass[i] += flash[i] ? " anim1" : " anim2";
    else console.log(`${i} missing from flash`);
  }
  // console.log('inputClass', inputClass)

  function updateIfChanged(oldVal, newVal, name) {
    var parsedNewVal = newVal.replace(/[^0-9.]+/g, "");
    if (oldVal !== parsedNewVal) {
      if (oldVal === "0" && isNumber(parsedNewVal)) {
        var noLeading0 = parseFloat(parsedNewVal).toString();
      } else noLeading0 = parsedNewVal;
      updateUserInput(name, noLeading0);
    }
  }

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
                // className={flash["homeVal"] ? `form-control anim1 ${class_validHomeVal}` : `form-control anim2 ${class_validHomeVal}`}
                className={inputClass["homeVal"]}
                value={cashFormat(displayState["homeVal"])}
                onChange={(e) => updateIfChanged(displayState["homeVal"], e.target.value, "homeVal")}
              />
              <ValidFbComp x={valid["homeVal"]} />
            </div>
            <div className="col-2 text-center align-self-center">or</div>
            <div className="col-5 ps-0">
              <label>Monthly Payment</label>
              <input
                type="text"
                className={inputClass["monthlyPayment"]}
                onChange={(e) => updateIfChanged(displayState["monthlyPayment"], e.target.value, "monthlyPayment")}
                value={cashFormat(displayState["monthlyPayment"])}
              />
              <ValidFbComp x={valid["monthlyPayment"]} />
              {/* {valid.monthlyPayment === null ? null : (
                <div className="invalid-feedback" style={{ display: "initial" }}>
                  {valid.monthlyPayment}
                </div>
              )} */}
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
                  className={inputClass["downPayCash"]}
                  // className={userSetDownPercent ? (flash["downPay"] ? "form-control anim1" : "form-control anim2") : "form-control"}
                  style={{ width: "70px" }}
                  value={cashFormat(displayState["downPayCash"])}
                  onChange={(e) => {
                    updateIfChanged(displayState["downPayCash"], e.target.value, "downPayCash");

                    // updateUserInput("downPayCash", e.target.value.replace(/[^0-9.]+/g, ""))
                    // updateDownPayCash(e.target.value.replace(/[^0-9.]+/g, ""));
                  }}
                />
                <span className="input-group-text" id="basic-addon1">
                  or
                </span>
                <input
                  type="text"
                  className={inputClass["downPayPercent"]}
                  // className={userSetDownPercent ? "form-control" : flash["downPay"] ? "form-control anim1" : "form-control anim2"}
                  value={displayState["downPayPercent"]}
                  onChange={(e) => {
                    updateIfChanged(displayState["downPayPercent"], e.target.value, "downPayPercent");
                    // updateUserInput("downPayPercent", e.target.value)

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
                className={inputClass["loanAmount"]}
                // className={flash["loanAmount"] ? "form-control anim1" : "form-control anim2"}
                value={cashFormat(displayState["loanAmount"])}
                onChange={
                  (e) =>
                    // console.log("triggered loanAmount Change");
                    updateIfChanged(displayState["loanAmount"], e.target.value, "loanAmount")
                  // updateUserInput("loanAmount", e.target.value.replace(/[^0-9.]+/g, ""))

                  // setLoanAmount(e.target.value.replace(/[^0-9.]+/g, ""));
                }
              />
            </div>
          </div>
          <div className="row">
            <div className="col-xl-6 col-12">
              <label>Interest rate</label>
              <div className="input-group mb-1">
                <input
                  type="text"
                  // className="form-control"
                  className={inputClass["interestRate"]}
                  value={displayState["interestRate"]}
                  onChange={(e) => updateIfChanged(displayState["interestRate"], e.target.value, "interestRate")}
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
                  className={inputClass["loanLength"]}
                  value={displayState["loanLength"]}
                  onChange={(e) => {
                    updateIfChanged(displayState["loanLength"], e.target.value, "loanLength");
                    // updateUserInput("loanLength", e.target.value.replace(/[^0-9.]+/g, ""));
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
                  className={inputClass["propertyTax"]}
                  value={
                    displayState["propertyTaxUnit"] == 0 || displayState["propertyTaxUnit"] == 1
                      ? cashFormat(displayState["propertyTax"])
                      : displayState["propertyTax"]
                  }
                  onChange={(e) => {
                    // var x = Number(e.target.value.replace(/[^0-9.]+/g, ""));
                    updateIfChanged(displayState["propertyTax"], e.target.value, "propertyTax");
                    // updateUserInput("propertyTax", x);

                    // setPropertyTax(x);
                    // setAdditionalMonthly(displayState['hoa'] * unitScaler(displayState['hoaUnit']) + x * unitScaler(displayState['propertyTaxUnit']) + displayState['insurance'] * unitScaler(displayState['insuranceUnit']));
                  }}
                />

                <select
                  type="text"
                  className="form-select px-2 input-group-text"
                  value={displayState["propertyTaxUnit"]}
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
                <ValidFbComp x={valid["propertyTax"]} />
              </div>
            </div>

            <div className="col-xl-6 col-12">
              <label>HoA</label>
              <div className="input-group mb-1">
                <input
                  type="text"
                  className={inputClass["hoa"]}
                  value={displayState["hoaUnit"] == 0 || displayState["hoaUnit"] == 1 ? cashFormat(displayState["hoa"]) : displayState["hoa"]}
                  onChange={(e) => {
                    // var x = Number(e.target.value.replace(/[^0-9.]+/g, ""));
                    // updateUserInput("hoa", x);
                    updateIfChanged(displayState["hoa"], e.target.value, "hoa");

                    // setHoa(x);
                    // setAdditionalMonthly(x * unitScaler(displayState['hoaUnit']) + displayState['propertyTax'] * unitScaler(displayState['propertyTaxUnit']) + displayState['insurance'] * unitScaler(displayState['insuranceUnit']));
                  }}
                />

                <select
                  type="text"
                  className="form-select px-2 input-group-text"
                  value={displayState["hoaUnit"]}
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
                <ValidFbComp x={valid["hoa"]} />
              </div>
            </div>
          </div>

          <div className="row mx-0">
            <div className="col-xl-6 col-12">
              <label>Insurance</label>
              <div className="input-group mb-1">
                <input
                  type="text"
                  className={inputClass["insurance"]}
                  value={
                    displayState["insuranceUnit"] == 0 || displayState["insuranceUnit"] == 1 ? cashFormat(displayState["insurance"]) : displayState["insurance"]
                  }
                  onChange={(e) => updateIfChanged(displayState["insurance"], e.target.value, "insurance")}
                />

                <select
                  type="text"
                  className="form-select px-2 input-group-text"
                  value={displayState["insuranceUnit"]}
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
                <ValidFbComp x={valid["insurance"]} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanForm;
