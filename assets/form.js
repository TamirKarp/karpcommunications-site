(function () {
  var MAIL = 'info@karpcommunications.com';

  var GUIDE_ERRORS = {
    invalid: 'Please add a valid email address and tick the box to agree.',
    rate: 'Too many requests from your connection. Please try again in a few minutes.',
    busy: 'A lot of people have asked for the guide today. Please try again tomorrow, or email ' + MAIL + ' and I will send it by hand.',
    send: 'Sorry, that did not send. Please email ' + MAIL + ' and I will send the guide by hand.'
  };

  document.querySelectorAll('form[data-kc-form], form[data-kc-guide]').forEach(function (form) {
    var isGuide = form.hasAttribute('data-kc-guide');
    var status = form.querySelector('.kc-form-status');
    var button = form.querySelector('button[type="submit"]');

    function say(text, cls) {
      status.textContent = text;
      status.className = 'kc-form-status ' + (cls || '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var payload;
      if (isGuide) {
        if (!form.email.value || !form.email.validity.valid || !form.consent.checked) {
          say(GUIDE_ERRORS.invalid, 'err');
          return;
        }
        payload = {
          source: 'guide',
          name: form.name.value,
          email: form.email.value,
          consent: form.consent.checked,
          _gotcha: form._gotcha.value
        };
      } else {
        if (!form.email.value || !form.email.validity.valid || !form.message.value.trim()) {
          say('Please add a valid email address and a message.', 'err');
          return;
        }
        payload = Object.fromEntries(new FormData(form));
      }

      if (form.getAttribute('action').indexOf('FORM_ENDPOINT') !== -1) {
        say('This form is not connected yet. Please email ' + MAIL + ' instead.', 'err');
        return;
      }

      var sentTo = form.email.value;
      button.disabled = true;
      say('Sending...');

      fetch(form.action, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, body: j }; });
        })
        .then(function (res) {
          if (!res.ok) {
            var msg = isGuide && GUIDE_ERRORS[res.body.error];
            say(msg || 'Sorry, that did not send. Please email ' + MAIL + ' instead.', 'err');
            return;
          }
          form.reset();
          say(isGuide
            ? 'Done. The guide is on its way to ' + sentTo + '. If it has not arrived in a few minutes, check your spam folder.'
            : 'Thank you. Your message has been sent and I will reply by email.', 'ok');
        })
        .catch(function () {
          say(isGuide ? GUIDE_ERRORS.send : 'Sorry, that did not send. Please email ' + MAIL + ' instead.', 'err');
        })
        .then(function () { button.disabled = false; });
    });
  });
})();
