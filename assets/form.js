(function () {
  var MAIL = 'info@karpcommunications.com';

  document.querySelectorAll('form[data-kc-form]').forEach(function (form) {
    var status = form.querySelector('.kc-form-status');
    var button = form.querySelector('button[type="submit"]');

    function say(text, cls) {
      status.textContent = text;
      status.className = 'kc-form-status ' + (cls || '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.email.value || !form.email.validity.valid || !form.message.value.trim()) {
        say('Please add a valid email address and a message.', 'err');
        return;
      }
      if (form.getAttribute('action').indexOf('FORM_ENDPOINT') !== -1) {
        say('This form is not connected yet. Please email ' + MAIL + ' instead.', 'err');
        return;
      }

      button.disabled = true;
      say('Sending...');

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (r) {
          if (!r.ok) throw new Error('bad status');
          form.reset();
          say('Thank you. Your message has been sent and I will reply by email.', 'ok');
        })
        .catch(function () {
          say('Sorry, that did not send. Please email ' + MAIL + ' instead.', 'err');
        })
        .then(function () { button.disabled = false; });
    });
  });
})();
