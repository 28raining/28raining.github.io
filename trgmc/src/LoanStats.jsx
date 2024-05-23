function LoanStats({ loanRes, loanEvent }) {
  var timeSaved = loanRes["numMonths"] - loanRes["endMonth"];
  var yearsSaved = Math.floor(timeSaved / 12);
  var monthSaved = timeSaved % 12;

  var showTimeReduced = false;
  for (var i = 0; i < loanEvent.length; i++) {
    if (loanEvent[i]["event"] == "Over-payment") showTimeReduced = true;
  }

  return (
    <div className="row shadow-sm border rounded mb-2 py-3 mx-0">
      <div className="col-12">
        <div className="row pb-2">
          <div className="input-group">
            <span className="input-group-text outputLabelWidth" id="basic-addon1">
              Total re-payment
            </span>
            <output type="text" className="form-control bg-info-subtle">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(
                loanRes["totalRepay"]
              )}
            </output>
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
