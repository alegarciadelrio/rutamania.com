(function () {
  'use strict';

  var form = document.getElementById('quote');
  if (!form) return;

  var out = {
    rental: document.getElementById('rentalCost'),
    pickup: document.getElementById('pickupFee'),
    ret: document.getElementById('returnFee'),
    total: document.getElementById('totalAmount')
  };

  function value(name) {
    return parseInt(form.elements[name].value, 10) || 0;
  }

  function calculate() {
    var rental = value('motorbike') * value('days');
    var pickup = value('pickup');
    var ret = value('return');

    out.rental.textContent = '$' + rental;
    out.pickup.textContent = '$' + pickup;
    out.ret.textContent = '$' + ret;
    out.total.textContent = '$' + (rental + pickup + ret);
  }

  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  calculate();
})();
