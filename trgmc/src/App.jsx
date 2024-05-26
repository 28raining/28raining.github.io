import { useState, useRef } from "react";
import "./App.css";
// import { PlusCircle } from "react-bootstrap-icons";
import LoanForm from "./LoanForm.jsx";
import loanMaths from "./loanMaths.js";
import LoanPlot from "./LoanPlot.jsx";
import LoanStats from "./LoanStats.jsx";
import EventsForm from "./EventsForm.jsx";
// import MonthlyPayment from "./MonthlyPayment.jsx";

function runCalculations(userInput, loanEvent, chosenInput, userSetDownPercent) {
  var monthlyExtraPercent = 0;
  var monthlyExtraFee = 0;
  var displayState = {};
  for (const x of [
    { num: userInput["propertyTax"], unit: userInput["propertyTaxUnit"] },
    { num: userInput["hoa"], unit: userInput["hoaUnit"] },
    { num: userInput["insurance"], unit: userInput["insuranceUnit"] },
  ]) {
    if (x.unit == 0) monthlyExtraFee = monthlyExtraFee + parseFloat(x.num) / 12;
    else if (x.unit == 1) monthlyExtraFee = monthlyExtraFee + parseFloat(x.num);
    else if (x.unit == 2) monthlyExtraPercent = monthlyExtraPercent + parseFloat(x.num) / 12;
    else if (x.unit == 3) monthlyExtraPercent = monthlyExtraPercent + parseFloat(x.num);
  }

  const loanAmount = userSetDownPercent
    ? userInput["homeVal"] * (1 - 0.01 * parseFloat(userInput["downPayPercent"]))
    : parseFloat(userInput["homeVal"]) - parseFloat(userInput["downPayCash"]);
  const downPay = userSetDownPercent ? parseFloat(userInput.downPayPercent) * 0.01 : parseFloat(userInput.downPayCash);

  var loanRes = loanMaths(
    parseFloat(loanAmount),
    parseFloat(userInput["loanLength"]),
    parseFloat(userInput["interestRate"]),
    loanEvent,
    chosenInput,
    parseFloat(userInput["monthlyPayment"]),
    parseFloat(downPay),
    userSetDownPercent,
    parseFloat(monthlyExtraPercent),
    parseFloat(monthlyExtraFee)
  );

  const homeVal = parseFloat(loanRes["homeVal"]);

  if (chosenInput == "monthlyPayment") {
    displayState["monthlyPayment"] = userInput["monthlyPayment"];
  } else {
    displayState["monthlyPayment"] = parseFloat(loanRes["monthlyPayment"][0]);
  }
  if (userSetDownPercent) {
    displayState["downPayPercent"] = userInput["downPayPercent"];
    displayState["downPayCash"] = homeVal * parseFloat(userInput["downPayPercent"]) * 0.01;
  } else {
    displayState["downPayPercent"] = ((100 * parseFloat(userInput.downPayCash)) / homeVal).toFixed(2);
    displayState["downPayCash"] = parseFloat(userInput.downPayCash);
  }

  if (chosenInput == "homeVal") {
    displayState["homeVal"] = userInput.homeVal;
  } else {
    displayState["homeVal"] = parseFloat(loanRes["loanAmount"]) + parseFloat(userInput.downPayCash);
  }
  displayState["interestRate"] = userInput["interestRate"];
  displayState["loanLength"] = userInput["loanLength"];
  displayState["loanAmount"] = loanRes["loanAmount"];

  displayState["propertyTax"] = userInput["propertyTax"];
  displayState["hoa"] = userInput["hoa"];
  displayState["insurance"] = userInput["insurance"];
  displayState["propertyTaxUnit"] = userInput["propertyTaxUnit"];
  displayState["hoaUnit"] = userInput["hoaUnit"];
  displayState["insuranceUnit"] = userInput["insuranceUnit"];

  return [displayState, loanRes];
}

//determines if a string is a number
export function isNumber(num) {
  if (num === "") return false;
  return !isNaN(num);
}

function App() {
  const [loanEvent, setLoanEvent] = useState([]);
  const [chosenInput, setChosenInput] = useState("homeVal");
  const [userSetDownPercent, setUserSetDownPercent] = useState(false);
  const [userInput, setUserInput] = useState({
    homeVal: "500000",
    monthlyPayment: "0",
    downPayCash: "100000",
    downPayPercent: "0",
    interestRate: "5.00",
    loanLength: "30",
    propertyTax: "0",
    hoa: "0",
    insurance: "0",
    propertyTaxUnit: 0,
    hoaUnit: 1,
    insuranceUnit: 0,
  });
  const [flash, setFlash] = useState({
    loanAmount: false,
    monthlyPayment: false,
    homeVal: false,
    downPayCash: false,
    downPayPercent: false,
    interestRate: false,
    loanLength: false,
    propertyTax: false,
    hoa: false,
    insurance: false,
  });
  const [valid, setValid] = useState({
    homeVal: null,
    monthlyPayment: null,
    downPayCash: null,
    downPayPercent: null,
    loanAmount: null,
    interestRate: null,
    loanLength: null,
    propertyTax: null,
    hoa: null,
    insurance: null,
  });
  const [displayState, setDisplayState] = useState({});
  const [loanRes, setLoanRes] = useState({});

  function useFirstRender() {
    const ref = useRef(true);
    const firstRender = ref.current;
    ref.current = false;
    return firstRender;
  }
  if (useFirstRender()) {
    var newDisplayState, newLoanRes;
    [newDisplayState, newLoanRes] = runCalculations(userInput, loanEvent, chosenInput, userSetDownPercent);
    setDisplayState(newDisplayState);
    setLoanRes(newLoanRes);
  }

  function updateUserInput(field, value) {
    var newUserInput = { ...userInput };
    var newFlash = { ...flash };
    var newChosenInput = chosenInput;
    var newValid = { ...valid };
    var newUserSetDownPercent = userSetDownPercent;
    var newDisplayState = { ...displayState };

    // if (userSetDownPercent) {
    //   var downPayCash = (loanRes["loanAmount"] * userInput["downPayPercent"]) / 100;
    // } else {
    //   var downPayCash = parseFloat(userInput.downPayCash);
    // }

    newDisplayState[field] = value; //FIXME - can do the same thing with user input?

    if (field == "homeVal") {
      newChosenInput = "homeVal";
      // newFlash["loanAmount"] = !flash["loanAmount"];
      if (userSetDownPercent) newFlash["downPayCash"] = !flash["downPayCash"];
      else newFlash["downPayPercent"] = !flash["downPayPercent"];
      newUserInput.homeVal = value;
    } else if (field == "loanAmount") {
      newChosenInput = "homeVal";
      newUserInput.homeVal = userSetDownPercent
        ? parseFloat(value) / (1 - 0.01 * userInput["downPayPercent"])
        : parseFloat(value) + parseFloat(userInput["downPayCash"]);
      newFlash["homeVal"] = !flash["homeVal"];
      if (userSetDownPercent) newFlash["downPayCash"] = !flash["downPayCash"];
      else newFlash["downPayPercent"] = !flash["downPayPercent"];
    } else if (field == "monthlyPayment") {
      newChosenInput = "monthlyPayment";
      // newFlash["loanAmount"] = !flash["loanAmount"];
      if (userSetDownPercent) newFlash["downPayCash"] = !flash["downPayCash"];
      else newFlash["downPayPercent"] = !flash["downPayPercent"];
      newUserInput["monthlyPayment"] = value;
    } else if (field == "interestRate") {
      newUserInput.interestRate = value;
    } else if (field == "loanLength") {
      newUserInput.loanLength = value;
    } else if (field == "downPayCash") {
      newUserSetDownPercent = false;
      newUserInput.downPayCash = value;
      if (newChosenInput != "homeVal") newFlash["loanAmount"] = !flash["loanAmount"]; //stop it flashing
    } else if (field == "downPayPercent") {
      newUserSetDownPercent = true;
      newUserInput.downPayPercent = value;
      if (newChosenInput != "homeVal") newFlash["loanAmount"] = !flash["loanAmount"]; //stop it flashing

      // newFlash["loanAmount"] = !flash["loanAmount"];
    } else if (field == "insurance") {
      newUserInput.insurance = value;
    } else if (field == "insuranceUnit") {
      newUserInput.insuranceUnit = value;
    } else if (field == "hoa") {
      newUserInput.hoa = value;
    } else if (field == "hoaUnit") {
      newUserInput.hoaUnit = value;
    } else if (field == "propertyTax") {
      newUserInput.propertyTax = value;
    } else if (field == "propertyTaxUnit") {
      newUserInput.propertyTaxUnit = value;
    }

    if (newChosenInput == "homeVal") {
      newFlash["monthlyPayment"] = !newFlash["monthlyPayment"];
      newFlash["loanAmount"] = !newFlash["loanAmount"];
    } else {
      newFlash["homeVal"] = !newFlash["homeVal"];
      newFlash["loanAmount"] = !newFlash["loanAmount"];
    }

    // console.log("newUserInput", newUserInput)
    for (const i in newUserInput) {
      newValid[i] = null;
      if (!isNumber(newUserInput[i])) {
        newValid[i] = "Must be a valid number";
      } else {
        var inputNumber = parseInt(newUserInput[i]);
        if (i == "homeVal" || i == "loanAmount" || i == "monthlyPayment") {
          if (inputNumber <= 0) {
            newValid[i] = "Must be a greater than 0";
          }
        }
        if (i == "homeVal" && !newUserSetDownPercent) {
          // var newDownPay = field == "downPayCash" ? newUserInput.downPayCash : downPayCash;
          if (inputNumber <= newUserInput.downPayCash) {
            newValid[i] = "Must be a greater than down payment";
          }
        }
        if (
          (i == "downPayPercent" && newUserSetDownPercent) ||
          (i == "insurance" && newUserInput.insuranceUnit > 1) ||
          (i == "hoa" && newUserInput.hoaUnit > 1) ||
          (i == "propertyTax" && newUserInput.propertyTaxUnit > 1)
        ) {
          // var newDownPay = field == "downPayCash" ? newUserInput.downPayCash : downPayCash;
          if (inputNumber > 100) {
            newValid[i] = "Must be <100%";
          }
        }
        if ((i == "propertyTax" || i == "hoa" || i == "insurance") && newChosenInput == "monthlyPayment") {
          // var newDownPay = field == "downPayCash" ? newUserInput.downPayCash : downPayCash;
          if (inputNumber > newUserInput.monthlyPayment) {
            newValid[i] = "Must be < than monthly payment";
          }
        }
      }
    }
    if (newChosenInput == "monthlyPayment") newValid["homeVal"] = null;
    else newValid["monthlyPayment"] = null;

    var allValid = true;
    for (const i in newValid) if (newValid[i] !== null) allValid = false;
    // console.log("valid", allValid, newValid);

    if (allValid) {
      var newLoanRes;
      [newDisplayState, newLoanRes] = runCalculations(newUserInput, loanEvent, newChosenInput, newUserSetDownPercent);
      setLoanRes(newLoanRes);
      setFlash(newFlash);
    }

    setDisplayState(newDisplayState);

    setUserInput(newUserInput);
    setChosenInput(newChosenInput);
    setUserSetDownPercent(newUserSetDownPercent);
    setValid(newValid);
  }

  function unitScaler(u) {
    return u == 0 ? 1 / 12 : u == 1 ? 1 : u == 2 ? (displayState["homeVal"] * 0.01) / 12 : u == 3 ? displayState["homeVal"] * 0.01 : 0;
  }

  return (
    <>
      <nav className="navbar bg-body-tertiary mb-2">
        <div className="container-xxl">
          <a className="navbar-brand" href="#">
            <b>t</b>he <b>R</b>eally <b>G</b>ood <b>M</b>ortgage <b>C</b>alculator
          </a>
        </div>
      </nav>
      <div className="container-xxl">
        <div className="row">
          <div className="col-md-5 col-12">
            <LoanForm displayState={displayState} valid={valid} flash={flash} updateUserInput={(f, v) => updateUserInput(f, v)} />
            <EventsForm
              loanMonths={loanRes["loanMonths"]}
              loanEvent={loanEvent}
              setLoanEvent={(e) => {
                setLoanEvent(e);
                var newDisplayState, newLoanRes;
                [newDisplayState, newLoanRes] = runCalculations(userInput, e, chosenInput, userSetDownPercent);
                setDisplayState(newDisplayState);
                setLoanRes(newLoanRes);
              }}
              monthlyPaymentPerEvent={loanRes["monthlyPaymentPerEvent"]}
            />

            <LoanStats loanRes={loanRes} loanEvent={loanEvent} />
          </div>
          <div className="col-md-7 col-12">
            <LoanPlot
              maxMonthly={Math.max(loanRes["monthlyPayment"])}
              loanRes={loanRes}
              loanMonths={loanRes["loanMonths"]}
              propertyTax={userInput["propertyTax"] * unitScaler(userInput["propertyTaxUnit"])}
              hoa={userInput["hoa"] * unitScaler(userInput["hoaUnit"])}
              insurance={userInput["insurance"] * unitScaler(userInput["insuranceUnit"])}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
