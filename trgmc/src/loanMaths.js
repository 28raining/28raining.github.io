function loanCalc(numMonths, interestRate, loanAmount, chosenInput, monthlyPaymentInput, downPayCash, monthlyExtraPercent, monthlyExtraFee) {
  // console.log('loanCalc', numMonths, interestRate, loanAmount, chosenInput, monthlyPaymentInput, downPayCash, monthlyExtraPercent, monthlyExtraFee)

  var monthlyInterest = 1 + interestRate / (12 * 100);
  var interestScalar = monthlyInterest ** numMonths;
  var T = (monthlyExtraPercent/100);


  if (chosenInput == "monthly_payment") {
    var actualMonthly = monthlyPaymentInput - monthlyExtraFee;
    var totalRepay = numMonths * actualMonthly;
    if (interestRate == 0) {
      var loanAmount_new = totalRepay;
    } else {
      var Z = ((interestScalar - 1) / (interestRate / (12 * 100))) / interestScalar;
      // console.log('bp7', actualMonthly, T, Z, interestRate, interestScalar)
      var homeVal = (actualMonthly / (T + 1/Z)) + downPayCash/(T*Z + 1);
      var loanAmount_new = homeVal - downPayCash;
      var monthlyTax = homeVal * T;

      // var compoundTotalRepay = actualMonthly * ((interestScalar - 1) / (interestRate / (12 * 100)));
      // var loanAmount_new = compoundTotalRepay / interestScalar;
    }
    // console.log('bp85', loanAmount, loanAmount_new, actualMonthly, monthlyTax, numMonths, interestScalar, monthlyExtraFee)

    return { monthly: actualMonthly - monthlyTax, totalRepay: totalRepay, loanAmount: loanAmount_new, monthlyExta: monthlyTax+monthlyExtraFee };
  } else {
    var totalRepay = loanAmount * interestScalar;
    if (interestRate == 0) {
      var monthly = totalRepay / numMonths;
      var newTotalRepay = loanAmount;
    } else {
      var monthly = totalRepay / ((interestScalar - 1) / (interestRate / (12 * 100)));
      var newTotalRepay = monthly * numMonths;
    }
    var monthlyTax = (loanAmount+downPayCash) * T;
    // console.log('bp85', loanAmount, monthlyTax, numMonths, interestScalar, monthlyExtraFee)

    return { monthly: monthly, totalRepay: newTotalRepay, loanAmount: loanAmount, monthlyExta: monthlyTax + monthlyExtraFee };
  }
}

export default function loanMaths(loanAmount, numYears, interestRate, loanEvent, chosenInput, monthlyPaymentInput, downPayCash, monthlyExtraPercent, monthlyExtraFee) {
  // console.log('loanMaths', loanAmount, numYears, interestRate, loanEvent, chosenInput, monthlyPaymentInput, downPayCash, monthlyExtraPercent, monthlyExtraFee)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var loanMonths = [];
  var monthIndex;
  var start = 4;
  var thisMonth;
  var year = new Date().getFullYear();// % 100;
  var eventIndex = 0;
  var monthlyPaymentPerEvent = [];

  var numMonths = numYears * 12;

  var loanData = loanCalc(numMonths, interestRate, loanAmount, chosenInput, monthlyPaymentInput, downPayCash, monthlyExtraPercent, monthlyExtraFee);

  var monthlyPayment = new Array(numYears * 12);
  var monthlyInterest = new Array(numYears * 12);
  var monthlyPrincipal = new Array(numYears * 12);
  var remaining = new Array(numYears * 12 + 1);
  var loanCopy = {...loanData};
  remaining[0] = loanCopy["loanAmount"];

  var rate = interestRate / 100;

  for (var i = 0; i < numMonths; i++) {
    //Create a month label, i.e May 24
    monthIndex = (start + i) % 12;
    if (monthIndex == 0) year = year + 1;
    thisMonth = `${months[monthIndex]} ${year}`;
    loanMonths.push(thisMonth);

    //Check if any events happened that month
    if (loanEvent.length > eventIndex) {
      if (thisMonth == loanEvent[eventIndex]["date"]) {
        // console.log('Event!', loanEvent[eventIndex])
        if (loanEvent[eventIndex]["event"] == "Over-payment") {
          remaining[i] = remaining[i] + loanEvent[eventIndex]["cost"] - loanEvent[eventIndex]["change"];
        } else if (loanEvent[eventIndex]["event"] == "Refinance") {
          rate = Number(loanEvent[eventIndex].change) / 100;
          remaining[i] = remaining[i] + loanEvent[eventIndex].cost;
          if (loanEvent[eventIndex]["newLength"] != 0) numMonths = i + loanEvent[eventIndex]["newLength"] * 12;
          loanData = loanCalc(numMonths - i, rate * 100, remaining[i], "house_value", null, 0, monthlyExtraPercent, monthlyExtraFee);
          eventIndex = eventIndex + 1;
        }
        eventIndex = eventIndex + 1;
      }
    }
    //code is like this to handle recast on same date as overpayment
    if (loanEvent.length > eventIndex) {
      if (thisMonth == loanEvent[eventIndex]["date"]) {
        if (loanEvent[eventIndex]["event"] == "Recast") {
          // rate = loanEvent[eventIndex].change/100;
          remaining[i] = remaining[i] + loanEvent[eventIndex].cost;
          loanData = loanCalc(numMonths - i, interestRate, remaining[i], "house_value", null, 0, monthlyExtraPercent, monthlyExtraFee);
          eventIndex = eventIndex + 1;
        }
      }
    }

    //Calculate 'the numbers' for the month
    monthlyPayment[i] = loanData.monthly + loanData.monthlyExta;
    monthlyInterest[i] = (remaining[i] * rate) / 12;
    monthlyPrincipal[i] = loanData.monthly - monthlyInterest[i];
    remaining[i + 1] = remaining[i] - monthlyPrincipal[i];
    monthlyPaymentPerEvent[eventIndex] = loanData.monthly;

    if (remaining[i + 1] <= 0) {
      monthlyPrincipal[i] = monthlyPrincipal[i] + remaining[i + 1];
      monthlyPayment[i] = monthlyPrincipal[i] + monthlyInterest[i + 1];
      remaining[i + 1] = 0;
      break;
    }
  }

  //remove the last element of 'remaining' which should be 0
  remaining.splice(remaining.length - 1, 1);
  // console.log(monthlyPaymentPerEvent)

  //FIXME - total repay is not correct when there's events - must be fixed
  return {
    loanAmount: loanData["loanAmount"],
    endMonth: i,
    loanMonths: loanMonths,
    monthlyInterest: monthlyInterest,
    monthlyPayment: monthlyPayment,
    monthlyPrincipal: monthlyPrincipal,
    numMonths: numMonths,
    remaining: remaining,
    totalRepay: loanData["totalRepay"],
    monthlyPaymentPerEvent: monthlyPaymentPerEvent,
  };
}
