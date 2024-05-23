import { useState, useRef } from "react";
import "./App.css";
import { PlusCircle } from "react-bootstrap-icons";
import LoanForm from "./LoanForm.jsx";
import loanMaths from "./loanMaths.js";
import LoanPlot from "./LoanPlot.jsx";
import LoanStats from "./LoanStats.jsx";
import EventsForm from "./EventsForm.jsx";
import MonthlyPayment from "./MonthlyPayment.jsx";

//determines if a string is a number
function isNumber(num) {
  // console.log("is number", num, !isNaN(num));
  if (num == "") return false;
  return !isNaN(num);
}

function App() {
  // const [loanAmount, setLoanAmount] = useState(400e3);
  // const [interestRate, setInterestRate] = useState(5);
  // const [loanLength, setLoanLength] = useState(30);
  // const [addEventLoc, setAddEventLoc] = useState(0);
  // const a = useRef();
  // const [show, setShow] = useState(false);
  const [loanEvent, setLoanEvent] = useState([]);
  // const [additionalMonthly, setAdditionalMonthly] = useState([]);
  // const [monthlyPaymentInput, setMonthlyPaymentInput] = useState(null);
  const [chosenInput, setChosenInput] = useState("house_value");
  // const [downPayCash, setDownPayCash] = useState(100e3);
  // const [downPayPercent, setDownPayPercent] = useState(20);
  const [userSetDownPercent, setUserSetDownPercent] = useState(false);
  const [userInput, setUserInput] = useState({
    homeVal: "500000",
    monthlyPayment: "0",
    downPayCash: "100000",
    downPayPercent: "0",
    loanAmount: "0",
    interestRate: "5",
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
    monthly: false,
    homeVal: false,
    downPay: false,
  });

  const [valid, setValid] = useState({
    homeVal: null,
    monthlyPayment: null,
  });

  // var allValid = true;
  // for (const o in valid) {
  //   if (o != null) allValid = false;
  // }

  // const [propertyTax, setPropertyTax] = useState(0);
  // const [propertyTaxUnit, setPropertyTaxUnit] = useState(0);
  // const [hoa, setHoa] = useState(0);
  // const [hoaUnit, setHoaUnit] = useState(1);
  // const [insurance, setInsurance] = useState(0);
  // const [insuranceUnit, setInsuranceUnit] = useState(0);

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

  var displayState;
  var monthlyExtraPercent = 0;
  var monthlyExtraFee = 0;
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

  const loanAmount = parseFloat(userInput["homeVal"]) - parseFloat(userInput.downPayCash);

  var loanRes = loanMaths(
    parseFloat(loanAmount),
    parseFloat(userInput["loanLength"]),
    parseFloat(userInput["interestRate"]),
    loanEvent,
    chosenInput,
    parseFloat(userInput["monthlyPayment"]),
    parseFloat(userInput.downPayCash),
    parseFloat(monthlyExtraPercent),
    parseFloat(monthlyExtraFee)
  );

  var displayState = {};

  const homeVal = parseFloat(loanRes["loanAmount"]) + parseFloat(userInput.downPayCash);

  if (chosenInput == "monthly_payment") {
    displayState["monthlyPayment"] = userInput["monthlyPayment"];
    // "homeVal" : monthlyPaymentInput,
  } else {
    displayState["monthlyPayment"] = parseFloat(loanRes["monthlyPayment"][0]);
    // "homeVal" : homeVal,
  }
  if (userSetDownPercent) {
    displayState["downPayPercent"] = userInput["downPayPercent"];
    displayState["downPayCash"] = (loanRes["loanAmount"] * userInput["downPayPercent"]) / 100;
  } else {
    displayState["downPayPercent"] = ((100 * parseFloat(userInput.downPayCash)) / homeVal).toFixed(2);
    displayState["downPayCash"] = parseFloat(userInput.downPayCash);
  }

  if (chosenInput == "house_value") {
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

  function updateUserInput(field, value) {
    var newUserInput = { ...userInput };
    var newFlash = { ...flash };
    var newChosenInput = chosenInput;
    var newValid = { ...valid };

    if (field == "homeVal") {
      newChosenInput = "house_value"; //FIXME - use homeVal not house_value
      newFlash["loanAmount"] = !flash["loanAmount"];
      newFlash["downPay"] = !flash["downPay"];
      newUserInput.homeVal = value;
      console.log(newUserInput.homeVal);
    } else if (field == "loanAmount") {
      newChosenInput = "house_value";
      newUserInput.homeVal = parseFloat(value) + parseFloat(displayState["downPayCash"]);
      newFlash["homeVal"] = !flash["homeVal"];
      newFlash["downPay"] = !flash["downPay"];
    } else if (field == "monthly") {
      newChosenInput = "monthly_payment";
      newFlash["loanAmount"] = !flash["loanAmount"];
      newFlash["downPay"] = !flash["downPay"];
      newUserInput["monthlyPayment"] = value;
    } else if (field == "interestRate") {
      newUserInput.interestRate = value;
    } else if (field == "loanLength") {
      newUserInput.loanLength = value;
    } else if (field == "downPayCash") {
      setUserSetDownPercent(false);
      newUserInput.downPayCash = value;
    } else if (field == "downPayPercent") {
      setUserSetDownPercent(true);
      newUserInput.downPayPercent = value;
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

    if (newChosenInput == "house_value") {
      newFlash["monthly"] = !flash["monthly"];
    } else {
      newFlash["homeVal"] = !flash["homeVal"];
    }

    setFlash(newFlash);
    setUserInput(newUserInput);
    setChosenInput(newChosenInput);

    for (const i in newUserInput) {
      newValid[i] = null;
      if (!isNumber(newUserInput[i])) {
        newValid[i] = "Must be a valid number";
      } else if (parseInt(newUserInput[i]) <= 0) {
        newValid[i] = "Must be a greater than 0";
      }
      if (i == "homeVal") {
        var newDownPay = field == "downPayCash" ? newUserInput.downPayCash : displayState["downPayCash"];
        if (parseInt(newUserInput[i]) <= newDownPay) {
          newValid[i] = "Must be a greater than down payment";
        }
      }
    }
    if (newChosenInput == "monthly_payment") newValid["homeVal"] = null
    else newValid["monthlyPayment"] = null

    setValid(newValid);

    console.log("done", newUserInput);
  }

  // console.log("bp09", userSetDownPercent, homeVal, displayState);

  function unitScaler(u) {
    return u == 0 ? 1 / 12 : u == 1 ? 1 : u == 2 ? (homeVal * 0.01) / 12 : u == 3 ? homeVal * 0.01 : 0;
  }

  // const loanMonths = nextNMonths(4, loanLength * 12)

  //Separate function so that either monthly or homeVal can flash appropriately
  function makeFlash(f) {
    if (f == "loanAmount") var toggleFlash = ["downPay", "monthly", "homeVal"];
    else if (f == "downPay") var toggleFlash = ["downPay"];

    if (f != "loanAmount") {
      if (chosenInput == "house_value") toggleFlash.push("monthly");
      else toggleFlash.push("homeVal");
    }

    var newFlash = { ...flash };
    for (const o of toggleFlash) newFlash[o] = !newFlash[o];
    console.log("newFlash", newFlash, chosenInput, f);
    setFlash(newFlash);
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
            <LoanForm
              // loanAmount={loanAmount}
              // interestRate={interestRate}
              // setInterestRate={(x) => setInterestRate(x)}
              // loanLength={loanLength}
              // setLoanLength={(x) => setLoanLength(x)}
              // setAdditionalMonthly={(x) => setAdditionalMonthly(x)}
              displayState={displayState}
              valid={valid}
              // setChosenInput={(e) => setChosenInput(e)}
              // downPayCash={downPayCash}
              // setDownPayCash={(e) => {
              //   makeFlash("downPay");

              //   // setFlash({ ...flash, monthly: !flash["monthly"], loanAmount: !flash["loanAmount"], downPay: !flash["downPay"] });
              //   setDownPayCash(e);
              // }}
              // downPayPercent={downPayPercent}
              // chosenInput={chosenInput}
              userSetDownPercent={userSetDownPercent}
              // setUserSetDownPercent={(e) => setUserSetDownPercent(e)}
              flash={flash}
              // setDownPayPercent={(e) => setDownPayPercent(e)}
              // setMonthlyPaymentInput={(e) => {
              //   changeChosenInput("monthly_payment");
              //   setFlash({ ...flash, loanAmount: !flash["loanAmount"], downPay: !flash["downPay"] });
              //   setMonthlyPaymentInput(e);
              // }}
              // propertyTax={propertyTax}
              // propertyTaxUnit={propertyTaxUnit}
              // hoa={hoa}
              // hoaUnit={hoaUnit}
              // insurance={insurance}
              // insuranceUnit={insuranceUnit}
              // setPropertyTax={(e) => setPropertyTax(e)}
              // setPropertyTaxUnit={(e) => setPropertyTaxUnit(e)}
              // setHoa={(e) => setHoa(e)}
              // setHoaUnit={(e) => setHoaUnit(e)}
              // setInsurance={(e) => setInsurance(e)}
              // setInsuranceUnit={(e) => setInsuranceUnit(e)}
              updateUserInput={(f, v) => updateUserInput(f, v)}
            />

            <EventsForm
              loanMonths={loanRes["loanMonths"]}
              loanEvent={loanEvent}
              setLoanEvent={(e) => setLoanEvent(e)}
              monthlyPaymentPerEvent={loanRes["monthlyPaymentPerEvent"]}
            />

            <LoanStats loanRes={loanRes} loanEvent={loanEvent} />
          </div>
          {/* <div
            className="col-1 rounded border"
            onMouseMove={(e) => moveAddEventLoc(e)}
            ref={a}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
          >
            <div style={{ position: "relative", top: `${addEventLoc}px` }}>
              <div style={{ position: "absolute", right: "100px", visibility: show ? "visible" : "hidden" }}>Add an event</div>
              <PlusCircle color="blue" size={48} />
            </div>
          </div> */}
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
