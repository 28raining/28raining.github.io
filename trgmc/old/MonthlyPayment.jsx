import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

function MonthlyPayment({ loanRes, setMonthlyPaymentInput, displayState }) {
  // 'monthlyInterest': monthlyInterest,
  // 'monthlyOther': monthlyOther,
  // 'monthlyPayment': monthlyPayment,
  // 'monthlyPrincipal': monthlyPrincipal,
  const widthPrincipleInterest = (100 * (loanRes["monthlyPrincipal"][0] + loanRes["monthlyInterest"][0])) / loanRes["monthlyPayment"][0];
  const widthPrincipleInterestFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(loanRes["monthlyPrincipal"][0] + loanRes["monthlyInterest"][0]);
  const widthOther = (100 * loanRes["monthlyOther"][0]) / loanRes["monthlyPayment"][0];
  const widthOtherFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(
    loanRes["monthlyOther"][0]
  );

  console.log();
  return (
    <div className="row shadow border rounded p-2 mb-3">
      <div className="col-6 px-0">
        <label>Monthly Payment</label>
        <input
          type="text"
          className="form-control"
          onChange={(e) => {
            setMonthlyPaymentInput(e.target.value.replace(/[^0-9.-]+/g, ""));
          }}
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
            minimumIntegerDigits: displayState["monthlyPayment"].length,
          }).format(displayState["monthlyPayment"])}
        />
      </div>
      {/* <div className="col-6 px-0">
        <label> </label>
        <div className="progress-stacked" style={{ height: "34px" }}>
          <OverlayTrigger overlay={<Tooltip id="allowAdd">{`Principle + Interest: ${widthPrincipleInterestFormat}`}</Tooltip>}>
            <div className="progress" style={{ width: `${widthPrincipleInterest}%`, height: "34px" }}>
              <div className="progress-bar" style={{ backgroundColor: "pink" }}></div>
            </div>
          </OverlayTrigger>
          <OverlayTrigger overlay={<Tooltip id="allowAdd">{`Tax: ${widthPrincipleInterestFormat}`}</Tooltip>}>
            <div className="progress" style={{ width: `${widthOther}%`, height: "34px" }}>
              <div className="progress-bar"></div>
            </div>
          </OverlayTrigger>
        </div>
      </div> */}
    </div>
  );
}

export default MonthlyPayment;
