import { useState } from "react";
import { DashCircle, Pen } from "react-bootstrap-icons";
// import Modal from "react-bootstrap/Modal";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { cashFormat } from "./LoanForm";
import { isNumber } from "./App";

function EventsForm({ loanMonths, loanEvent, setLoanEvent, monthlyPaymentPerEvent }) {
  const [chosenEvent, setChosenEvent] = useState("Over-payment");
  const [newChange, setNewChange] = useState(1000);
  const [chosenDate, setChosenDate] = useState(loanMonths[1]);
  const [newLength, setNewLength] = useState(0);
  const [cost, setCost] = useState(100);

  // console.log(monthlyPaymentPerEvent);

  // const handleClose = () => setShow(false);
  // const handleShow = () => setShow(true);

  const eventList = ["Over-payment", "Recast", "Refinance"];
  const description = {
    "Over-payment": "Pay extra money into the loan",
    Recast: "Reduce the monthly payments after over-paying",
    Refinance: "Change the interest rate",
  };

  function dateIsOlder(a, b) {
    return loanMonths.indexOf(a) > loanMonths.indexOf(b);
  }

  function sortEvents(a, b) {
    return loanMonths.indexOf(a["date"]) - loanMonths.indexOf(b["date"]);
  }

  function validRecastDate() {
    if (chosenEvent == "Recast") {
      var overPayFirst = false;
      for (const e of loanEvent) {
        if (dateIsOlder(e["date"], chosenDate)) {
          break;
        } else if (e["event"] == "Over-payment") {
          overPayFirst = true;
          break;
        }
      }
      return overPayFirst;
    } else {
      return true;
    }
  }

  function noOtherEvents() {
    if (chosenEvent != "Refinance") return true;
    for (const e of loanEvent) {
      if (e["date"] == chosenDate) return false;
    }
    return true;
  }

  const validDate = loanMonths.indexOf(chosenDate) >= 0;
  const validRecast = validRecastDate();
  const validOverpay = chosenEvent != "Over-payment" || newChange > 0;
  const canRefi = noOtherEvents();
  const canAdd = validDate & validRecast & validOverpay & canRefi;
  const canAddText = "Correct the form";
  const overPayText = "Overpay must be > 0";

  function addEvent() {
    var newEvent = {};
    newEvent["event"] = chosenEvent;
    newEvent["date"] = chosenDate;
    if (isNumber(cost)) newEvent["cost"] = parseFloat(cost);
    else newEvent["cost"] = 0;
    if (chosenEvent == "Recast") newEvent["change"] = "-";
    else newEvent["change"] = newChange;

    if (chosenEvent == "Refinance") newEvent["newLength"] = newLength;

    var newEventObj = [...loanEvent];
    newEventObj.push(newEvent);
    newEventObj.sort(sortEvents);
    setLoanEvent(newEventObj);

    var newDate = loanMonths.indexOf(chosenDate) + 1;
    setChosenDate(loanMonths[newDate]);
  }

  return (
    <div className="row shadow-sm border rounded mb-2 py-2 mx-0" key="row0">
      <div className="col-12" key="col0">
        <div className="row">
          <div className="col-12" key="col1">
            <div className="input-group ">
              {eventList.map((x, i) => (
                <OverlayTrigger overlay={<Tooltip key={`evDescTool_${i}`}>{description[x]}</Tooltip>} key={`evDesc_${i}`}>
                  <div className="form-check form-check-inline" key={x}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="chooseEvent"
                      checked={chosenEvent == x}
                      value={x}
                      onChange={(e) => {
                        if (e.target.value == "Refinance") setNewChange("5.00");
                        setChosenEvent(e.target.value);
                      }}
                    />
                    <label className="form-check-label">{x}</label>
                  </div>
                </OverlayTrigger>
              ))}
            </div>
          </div>
        </div>
        <div className="row">
          <div className={chosenEvent == "Recast" ? "col-6" : "col-xl-3 col-6"}>
            <label>Date:</label>
            <select className="form-select mb-1" onChange={(e) => setChosenDate(e.target.value)} value={chosenDate}>
              {loanMonths.map((x) => (
                <option value={x} key={x}>
                  {x}
                </option>
              ))}
            </select>

            {/* <input
              className={validDate ? "form-control px-1" : "form-control px-1 is-invalid"}
              list="datalistOptions"
              placeholder="Chose the month..."
              value={chosenDate}
              onChange={(e) => setChosenDate(e.target.value)}
            />
            <datalist id="datalistOptions">
              {loanMonths.map((x) => (
                <option value={x} key={x} />
              ))}
            </datalist> */}
            {!validDate ? (
              <div className="invalid-feedback" style={{ display: "initial" }}>
                Date invalid
              </div>
            ) : !validRecast ? (
              <div className="invalid-feedback" style={{ display: "initial" }}>
                Recast only possible after overpay
              </div>
            ) : !canRefi ? (
              <div className="invalid-feedback" style={{ display: "initial" }}>
                Cannot refinance on same date as other event
              </div>
            ) : null}
          </div>
          {chosenEvent == "Recast" ? null : (
            <div className="col-xl-3 col-6" key="col2">
              <label>{chosenEvent == "Over-payment" ? "Amount" : "New rate"}</label>
              <div className="input-group ">
                <input
                  type="text"
                  className="form-control px-1"
                  value={
                    chosenEvent == "Over-payment"
                      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(
                          newChange
                        )
                      : newChange
                  }
                  onChange={(e) => {
                    var stripped = e.target.value.replace(/[^0-9.-]+/g, "");
                    // console.log(stripped, e.target.value);
                    setNewChange(stripped);
                  }}
                />
                {chosenEvent == "Over-payment" ? null : (
                  <span className="input-group-text" id="basic-addon1">
                    %
                  </span>
                )}
              </div>
              {!validOverpay ? (
                <div className="invalid-feedback" style={{ display: "initial" }}>
                  {overPayText}
                </div>
              ) : null}
            </div>
          )}

          <div className="col-xl-3 col-6">
            <label>Cost</label>
            <div className="input-group ">
              <input
                type="text"
                className="form-control"
                value={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(cost)}
                onChange={(e) => {
                  setCost(e.target.value.replace(/[^0-9.-]+/g, ""));
                }}
              />
            </div>
          </div>

          <div className="col-xl-3 col-6">
            <label></label>
            {canAdd ? (
              <div className="d-grid gap-2">
                <button type="button" className="btn btn-outline-success" disabled={!canAdd} onClick={addEvent} style={canAdd ? {} : { pointerEvents: "none" }}>
                  Add
                </button>
              </div>
            ) : (
              <OverlayTrigger
                key="AddHelper"
                overlay={
                  <Tooltip id="allowAdd" key={`AddHelperTt`}>
                    {canAddText}
                  </Tooltip>
                }
              >
                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-success"
                    disabled={!canAdd}
                    onClick={addEvent}
                    style={canAdd ? {} : { pointerEvents: "none" }}
                  >
                    Add
                  </button>
                </div>
              </OverlayTrigger>
            )}
          </div>
        </div>

        {chosenEvent != "Refinance" ? null : (
          // <div className="row pb-2" key="row1a">
          <div className="row">
            <div className="col">
              <label>New loan length:</label>

              <input
                className="form-control px-1"
                placeholder="unchanged..."
                value={newLength == 0 ? "" : `${newLength}yr`}
                onChange={(e) => setNewLength(Number(e.target.value.replace(/[^0-9.-]+/g, "")))}
              />
            </div>
          </div>
        )}

        <div className="row" key="row3">
          <div className="col-12">
            {loanEvent.length == 0 ? null : (
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Event</th>
                    <th scope="col">Date</th>
                    <th scope="col">Cost</th>
                    <th scope="col">Change</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                {loanEvent.map((x, i) => (
                  <tbody key={i}>
                    <tr key={i}>
                      <th scope="row">{i + 1}</th>
                      <td>{x["event"]}</td>
                      <td>{x["date"]}</td>
                      <td>
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        }).format(x["cost"])}
                      </td>
                      <td>{`${x["change"]}${x["event"] == "Refinance" ? "%" : ""}`}</td>
                      <td key="pen">
                        <span
                          style={{ cursor: "pointer" }}
                          className="mx-1"
                          onClick={() => {
                            var newEventObj = [...loanEvent];
                            var oldEvent = newEventObj.splice(i, 1);
                            // console.log(oldEvent)
                            setChosenEvent(oldEvent[0]["event"]);
                            setChosenDate(oldEvent[0]["date"]);
                            setCost(oldEvent[0]["cost"]);
                            setNewChange(oldEvent[0]["change"]);
                            setLoanEvent(newEventObj);
                          }}
                        >
                          <OverlayTrigger key={`overlay_edit_${i}`} overlay={<Tooltip key={`overlay_edit_tt_${i}`}>{"Edit"}</Tooltip>}>
                            <Pen color="blue" size={16} key="iconPen" />
                          </OverlayTrigger>
                        </span>

                        <span
                          style={{ cursor: "pointer" }}
                          className="mx-1"
                          onClick={() => {
                            var newEventObj = [...loanEvent];
                            newEventObj.splice(i, 1);
                            setLoanEvent(newEventObj);
                          }}
                        >
                          <OverlayTrigger key={`overlay_rm_${i}`} overlay={<Tooltip key={`overlay_rm_tt_${i}`}>{"Remove"}</Tooltip>}>
                            <DashCircle color="blue" size={16} key="iconCircle" />
                          </OverlayTrigger>
                        </span>
                      </td>
                    </tr>
                    {x["event"] == "Refinance" ? (
                      <>
                        <tr key={"refi1"}>
                          <td></td>
                          <td colSpan={5}>New loan length: {x["newLength"] == "" ? <em>unchanged</em> : `${x["newLength"]}yr`}</td>
                        </tr>
                        <tr key={"refi2"}>
                          <td></td>
                          <td colSpan={5}>New monthly payment: {cashFormat(monthlyPaymentPerEvent[i + 1])}</td>
                        </tr>
                      </>
                    ) : null}
                  </tbody>
                ))}
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventsForm;
