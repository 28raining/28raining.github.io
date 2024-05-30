import { cashFormat } from "./LoanForm";

function scaleMonthlyWUnit(v, unit, homeVal, length) {
  if (unit == 0) return (parseFloat(v) * length) / 12;
  else if (unit == 1) return parseFloat(v) * length;
  else if (unit == 2) return (parseFloat(v) * homeVal * length) / 1200;
  else if (unit == 3) return (parseFloat(v) * homeVal * length) / 100;
}

function LoanStats({ loanRes, loanEvent, userInput }) {
  var timeSaved = loanRes["numMonths"] - loanRes["endMonth"];
  var yearsSaved = Math.floor(timeSaved / 12);
  var monthSaved = timeSaved % 12;

  var showTimeReduced = false;
  for (var i = 0; i < loanEvent.length; i++) {
    if (loanEvent[i]["event"] == "Over-payment") showTimeReduced = true;
  }

  var totalPrincipal = 0;
  var totalInterest = 0;
  for (const i of loanRes["monthlyPrincipal"]) totalPrincipal = totalPrincipal + i;
  for (const i of loanRes["monthlyInterest"]) totalInterest = totalInterest + i;
  var totalTax = scaleMonthlyWUnit(userInput["propertyTax"], userInput["propertyTaxUnit"], loanRes["homeVal"], loanRes["monthlyInterest"].length);
  var totalHoA = scaleMonthlyWUnit(userInput["hoa"], userInput["hoaUnit"], loanRes["homeVal"], loanRes["monthlyInterest"].length);
  var totalInsurance = scaleMonthlyWUnit(userInput["insurance"], userInput["insuranceUnit"], loanRes["homeVal"], loanRes["monthlyInterest"].length);
  // console.log("loanRes['monthlyPrincipal']", loanRes['monthlyPrincipal'],totalPrincipal)

  return (
    <div className="row shadow-sm border rounded mb-2 py-3 mx-0">
      <div className="col-12">
        <div className="row pb-2">
          <div className="col-12">
            <div className="input-group">
              <span className="input-group-text outputLabelWidth" id="basic-addon1">
                Total Loan re-payment
              </span>
              <output type="text" className="form-control bg-info-subtle">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(
                  totalPrincipal + totalInterest + loanRes["extraPayments"]
                )}
              </output>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="input-group">
              <span className="input-group-text outputLabelWidth" id="basic-addon1">
                Total costs
              </span>
              <output type="text" className="form-control bg-info-subtle">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(
                  totalPrincipal + totalInterest + loanRes["extraPayments"] + totalTax + totalHoA + totalInsurance
                )}
              </output>
            </div>
          </div>
        </div>
        <div className="row pb-2">
          <div className="col-12">
            <ul className="ps-5 pt-2">
              <li>Principal: {cashFormat(totalPrincipal)}</li>
              <li>Interest: {cashFormat(totalInterest)}</li>
              {loanRes["extraPayments"] > 0 ? <li>Overpayments & fees: {cashFormat(loanRes["extraPayments"])}</li> : null}
              {userInput["propertyTax"] > 0 ? <li>Tax: {cashFormat(totalTax)}</li> : null}
              {userInput["hoa"] > 0 ? <li>HoA: {cashFormat(totalHoA)}</li> : null}
              {userInput["insurance"] > 0 ? <li>Insurance: {cashFormat(totalInsurance)}</li> : null}
            </ul>
          </div>
        </div>
        {!showTimeReduced ? null : (
          <div className="row">
            <div className="input-group">
              <span className="input-group-text outputLabelWidth" id="basic-addon1">
                Time reduced due to overpayments
              </span>
              <output type="text" className="form-control bg-info-subtle">
                {`${yearsSaved}yr ${monthSaved}m`}
              </output>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoanStats;
