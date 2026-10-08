(function () {
  'use strict';

  var quote = document.getElementById('quote');
  var booking = document.getElementById('booking');
  if (!quote || !booking) return;

  var summary = document.getElementById('bookingSummary');
  var error = document.getElementById('bookingError');
  var WHATSAPP = '59899772747';

  function selectedText(name) {
    var select = quote.elements[name];
    return select.options[select.selectedIndex].text;
  }

  function quoteLines() {
    return [
      'Motorbike: ' + selectedText('motorbike'),
      'Days: ' + quote.elements.days.value,
      'Pickup: ' + selectedText('pickup'),
      'Return: ' + selectedText('return'),
      'Quoted total: ' + document.getElementById('totalAmount').textContent
    ];
  }

  function show(panel, hide) {
    hide.hidden = true;
    panel.hidden = false;
    var heading = panel.querySelector('h2');
    heading.focus({ preventScroll: true });
    panel.parentNode.scrollIntoView({ block: 'start' });
  }

  document.getElementById('startBooking').addEventListener('click', function () {
    summary.textContent = selectedText('motorbike').replace(/ \(.*\)$/, '') + ' · ' +
      quote.elements.days.value + ' days · ' + document.getElementById('totalAmount').textContent;
    show(booking, quote);
  });

  document.getElementById('backToQuote').addEventListener('click', function () {
    show(quote, booking);
  });

  var start = booking.elements.Start;
  var end = booking.elements.End;

  start.addEventListener('change', function () {
    end.min = start.value;
  });

  // "2026-11-15T09:30" -> "15/11/2026 09:30"
  function format(value) {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/.exec(value);
    return m ? m[3] + '/' + m[2] + '/' + m[1] + ' ' + m[4] : value;
  }

  booking.addEventListener('submit', function (e) {
    e.preventDefault();

    end.setCustomValidity(start.value && end.value && end.value <= start.value ?
      'The end must be after the start.' : '');

    var invalid = booking.querySelector(':invalid:not(fieldset)');
    if (invalid) {
      error.textContent = invalid === end && end.value ?
        end.validationMessage : 'Please answer all questions before sending.';
      error.hidden = false;
      invalid.focus();
      return;
    }
    error.hidden = true;

    var lines = ['Hi Rutamania! I would like to book a motorcycle.', ''].concat(quoteLines(), ['']);
    new FormData(booking).forEach(function (value, key) {
      if (key === 'Start' || key === 'End') value = format(value);
      lines.push(key + ': ' + (String(value).trim() || '-'));
    });

    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });
})();
