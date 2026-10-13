(function () {
  'use strict';

  var quote = document.getElementById('quote');
  var booking = document.getElementById('booking');
  if (!quote || !booking) return;

  var WHATSAPP = '59899772747';
  var MIN_DAYS = 10;

  var bike = quote.elements.Motorbike;
  var start = quote.elements.Start;
  var end = quote.elements.End;
  var pickup = quote.elements.Pickup;
  var ret = quote.elements.Return;

  function $(id) { return document.getElementById(id); }

  // Preselect the bike of the page we are on.
  var pageBike = quote.parentNode.getAttribute('data-bike');
  if (pageBike) bike.value = pageBike;

  function selected(select) {
    return select.options[select.selectedIndex];
  }

  function money(n) {
    return (n < 0 ? '−$' : '$') + Math.abs(n).toLocaleString('en-US');
  }

  // Days from the pickup date to the return date, like nights at a hotel.
  // "2026-11-01T10:00" to "2026-11-11T18:00" -> 10
  function days() {
    if (!start.value || !end.value) return 0;
    var a = start.value.slice(0, 10).split('-');
    var b = end.value.slice(0, 10).split('-');
    var ms = Date.UTC(b[0], b[1] - 1, b[2]) - Date.UTC(a[0], a[1] - 1, a[2]);
    return Math.round(ms / 864e5);
  }

  function fee(select) {
    return parseInt(selected(select).getAttribute('data-fee'), 10) || 0;
  }

  function show(id, visible) {
    $(id).hidden = !visible;
  }

  function calculate() {
    var price = parseInt(selected(bike).getAttribute('data-price'), 10);
    var count = days();
    // Until the dates are chosen, show the price of a minimum rental.
    var billed = count >= MIN_DAYS ? count : MIN_DAYS;
    var rental = price * billed;
    var fees = [fee(pickup), fee(ret)];
    var discount = fees.filter(function (f) { return f < 0; }).reduce(function (s, f) { return s + f; }, 0);
    var extra = fees.filter(function (f) { return f > 0; }).reduce(function (s, f) { return s + f; }, 0);

    $('rentalLabel').textContent = 'Rental · ' + billed + ' days × ' + money(price) +
      (count >= MIN_DAYS ? '' : ' (minimum)');
    $('rentalCost').textContent = money(rental);
    $('discountAmount').textContent = money(discount);
    $('extraAmount').textContent = money(extra);
    show('discountLabel', discount);
    show('discountAmount', discount);
    show('extraLabel', extra);
    show('extraAmount', extra);
    $('totalAmount').textContent = money(rental + discount + extra);
  }

  start.addEventListener('change', function () {
    end.min = start.value;
  });
  function update() {
    $('quoteError').hidden = true;
    calculate();
  }

  quote.addEventListener('input', update);
  quote.addEventListener('change', update);
  calculate();

  function quoteProblem() {
    if (!start.value) return [start, 'Please choose your pickup date and time.'];
    if (!end.value) return [end, 'Please choose your return date and time.'];
    if (end.value <= start.value) return [end, 'The return must be after the pickup.'];
    if (days() < MIN_DAYS) {
      return [end, 'The minimum rental is ' + MIN_DAYS + ' days. Your dates cover ' + days() + '.'];
    }
    return null;
  }

  function switchTo(panel, other) {
    other.hidden = true;
    panel.hidden = false;
    panel.querySelector('h2').focus({ preventScroll: true });
    panel.parentNode.scrollIntoView({ block: 'start' });
  }

  // "2026-11-15T09:30" -> "15/11/2026 09:30"
  function format(value) {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/.exec(value);
    return m ? m[3] + '/' + m[2] + '/' + m[1] + ' ' + m[4] : value;
  }

  function bikeName() {
    return selected(bike).text.replace(/ \(.*\)$/, '');
  }

  quote.addEventListener('submit', function (e) {
    e.preventDefault();
    var problem = quoteProblem();
    var error = $('quoteError');
    if (problem) {
      error.textContent = problem[1];
      error.hidden = false;
      problem[0].focus();
      return;
    }
    error.hidden = true;

    $('bookingSummary').textContent = bikeName() + ' · ' + days() + ' days · ' +
      $('totalAmount').textContent;
    switchTo(booking, quote);
  });

  $('backToQuote').addEventListener('click', function () {
    switchTo(quote, booking);
  });

  booking.addEventListener('submit', function (e) {
    e.preventDefault();

    var error = $('bookingError');
    var invalid = booking.querySelector(':invalid:not(fieldset)');
    if (invalid) {
      error.textContent = 'Please answer all questions before sending.';
      error.hidden = false;
      invalid.focus();
      return;
    }
    error.hidden = true;

    var lines = [
      'Hi Rutamania! I would like to book a motorcycle.',
      '',
      'Motorbike: ' + bikeName(),
      'Pickup: ' + format(start.value) + ' · ' + pickup.value,
      'Return: ' + format(end.value) + ' · ' + ret.value,
      'Days: ' + days(),
      'Quoted total: ' + $('totalAmount').textContent,
      ''
    ];
    new FormData(booking).forEach(function (value, key) {
      lines.push(key + ': ' + (String(value).trim() || '-'));
    });

    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });
})();
