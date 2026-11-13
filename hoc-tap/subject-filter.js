(() => {
  const filter = document.getElementById('study-filter');
  const cards = document.querySelectorAll('#study-courses > [data-subject]');
  const count = document.getElementById('study-filter-count');

  function update(subject) {
    let visible = 0;
    for (const card of cards) {
      card.hidden = subject !== 'all' && card.dataset.subject !== subject;
      if (!card.hidden) visible++;
    }
    count.textContent = visible + ' ứng dụng';
  }

  filter.addEventListener('change', event => {
    if (event.target.name === 'subject') update(event.target.value);
  });
  update(filter.querySelector('input:checked').value);
  filter.hidden = false;
})();
