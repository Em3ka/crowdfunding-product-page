const btnBackProject = document.getElementById('btnBackProject');
const btnBookmark = document.getElementById('btnBookmark');
const btnDismiss = document.getElementById('btnDismiss');
const btnCloseModal = document.getElementById('closeModal');
const pledgeModal = document.getElementById('pledgeModal');
const successModal = document.getElementById('successModal');
const messageEl = document.getElementById('modalMessage');
const progressBar = document.getElementById('progressBar');
const backers = document.getElementById('backersCount');
const backed = document.getElementById('backedAmount');
const daysLeft = document.getElementById('daysRemaining');
const pledgeList = document.getElementById('pledgeList');
const modalList = document.getElementById('modalList');
const overlay = document.getElementById('overlay');
const navToggle = document.querySelector('[aria-controls="primary-nav"]');
const pledgeCards = document.querySelectorAll('#pledgeCard');

const pledgeData = {
  backed: Number(backed.dataset.value) || 89914,
  backers: Number(backers.dataset.value) || 5007,
  days: Number(daysLeft.dataset.value) || 56,
};

const toggleBookmark = function (isBookmarked) {
  btnBookmark.setAttribute('aria-pressed', isBookmarked);
  btnBookmark.querySelector('span').textContent = isBookmarked
    ? 'Bookmarked'
    : 'Bookmark';
  btnBookmark.classList.toggle('div[aria-pressed="true"]', isBookmarked);
  localStorage.setItem('bookmark', JSON.stringify(isBookmarked));
};

const resizeObserver = new ResizeObserver(() => {
  document.body.classList.add('resizing');

  const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
  if (window.innerWidth >= 760 && isExpanded) {
    // Hide overlay at desktop size
    overlay.setAttribute('hidden', '');
  } else if (window.innerWidth < 760 && isExpanded) {
    // Show overlay when returning to mobile if nav is expanded
    overlay.removeAttribute('hidden');
  }

  requestAnimationFrame(() => {
    document.body.classList.remove('resizing');
  });
});

resizeObserver.observe(document.body);

const displayStats = function (element, stat) {
  const duration = 3000;
  const startTime = performance.now();

  const animate = (timestamp) => {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const currentNumber = Math.floor(progress * stat);

    element.textContent = formatNumber(currentNumber, element === backed);

    // https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
    if (progress < 1) requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
};

const closeModal = function () {
  togglePledgeModal();
  reset();
};

const toggleModal = function (modalElement, isForced = false) {
  const isHidden = modalElement.hasAttribute('hidden');

  if (isForced) {
    modalElement.toggleAttribute('hidden', !isHidden);
  } else {
    modalElement.toggleAttribute('hidden', !isHidden);
    overlay.toggleAttribute('hidden', !isHidden);
  }

  if (modalElement === pledgeModal) {
    document.body.classList.toggle('no-scroll', isHidden);

    // Scroll cards to the first option
    const modalCard = pledgeModal.querySelector('.card');
    modalCard.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};

const togglePledgeModal = function () {
  toggleModal(pledgeModal);
};

const renderMessageModal = function () {
  toggleModal(pledgeModal, true);
  toggleModal(successModal);
};

const formatNumber = (number, isCurrency = false) => {
  const formatted = number.toLocaleString();
  return isCurrency ? `$${formatted}` : formatted;
};

const reset = function () {
  resetPledgeContainer();
  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.checked = false;
  });
};

const resetPledgeContainer = function () {
  document.querySelectorAll('.pledge-container').forEach((container) => {
    container.remove();
  });
};

const updateCardState = function (card, newCount) {
  if (!card) return;

  const countElement = card.querySelector('.pledge-count');
  if (countElement) countElement.textContent = newCount;

  // Update the data attribute
  card.dataset.count = newCount;

  // Update out-of-stock status
  card.classList.toggle('card--out-of-stock', newCount === 0);

  // Update button state
  const button = card.querySelector('.button');
  if (button) {
    button.disabled = newCount === 0;
    button.textContent = newCount === 0 ? 'Out of Stock' : 'Select Reward';
  }

  // Disable radio button if out of stock
  const radio = card.querySelector('input[type="radio"]');
  if (radio) radio.disabled = newCount === 0;
};

const updatePledge = function (pledgeId, newCount, pledgeAmount) {
  if (pledgeAmount !== 0) pledgeData.backed += pledgeAmount;

  // pledgeData.backed += pledgeAmount;
  localStorage.setItem('pledgeData', JSON.stringify(pledgeData));

  // Update UI stats
  backed.textContent = formatNumber(pledgeData.backed, true);
  backed.dataset.value = pledgeData.backed;

  backers.textContent = formatNumber(pledgeData.backers);
  backers.dataset.value = pledgeData.backers;

  daysLeft.textContent = pledgeData.days;
  daysLeft.dataset.value = pledgeData.days;

  // Update cards
  const cards = [
    document.querySelector(`.pledge-list .card[data-id="${pledgeId}"]`),
    document.querySelector(`.modal .card[data-id="${pledgeId}"]`),
  ];

  cards.forEach((card) => updateCardState(card, newCount));
};

const savePledge = function (pledgeId, count) {
  const pledgeCounts = JSON.parse(localStorage.getItem('pledgeCounts') || '{}');
  pledgeCounts[pledgeId] = count;
  localStorage.setItem('pledgeCounts', JSON.stringify(pledgeCounts));
};

const calculateProgress = function (currentAmount, goalAmount = 100000) {
  const percentage = (currentAmount / goalAmount) * 100;
  return Math.min(percentage, 100);
};

const updateProgressBar = function (percentage, isInitial = false) {
  progressBar.classList.remove('goal-reached');

  // Set the progress width
  progressBar.style.setProperty('--progress-width', `${percentage}%`);

  if (isInitial) {
    progressBar.classList.add('animate-initial');
  } else {
    progressBar.classList.remove('animate-initial');
  }

  console.log(`Progress bar: ${percentage}`);

  // Add reached state if 100%
  if (percentage >= 100) {
    console.log('Goal reached!');
    progressBar.classList.add('goal-reached');
  }
};

const updateModalMessage = function (messageType = 'default') {
  const icon = messageEl.previousElementSibling;

  const messages = {
    default: {
      icon: 'icon-check',
      title: 'Thanks for your support!',
      message: `Your pledge brings us one step closer to sharing Mastercraft 
                Bamboo Monitor Riser worldwide. 
                You will get an email once our campaign is completed.`,
    },
    goalReached: {
      icon: 'icon-check',
      title: '🎉 Goal Reached!',
      message: `Amazing! We've reached our funding goal of $100,000. 
                Thank you for your incredible support!`,
    },
    alreadyReached: {
      icon: 'icon-caution',
      title: 'Maximum Goal Reached',
      message: `We've already reached our funding goal of $100,000.
                We cannot accept any more pledges at this time.
                Thank you for your interest!`,
    },
  };

  // Get the appropriate message config
  const messageConfig = messages[messageType] || messages.default;

  // Update icon
  icon.innerHTML = `
      <svg width="64" height="64">
        <use href="/assets/images/icons.svg#${messageConfig.icon}"></use>
      </svg>`;

  // Update message content
  messageEl.innerHTML = `
      <h2 class="heading-lg">${messageConfig.title}</h2>
      <p>${messageConfig.message}</p>`;
  renderMessageModal();
};

navToggle.addEventListener('click', () => {
  const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', !isExpanded);
  navToggle.setAttribute(
    'aria-label',
    !isExpanded ? 'close main menu' : 'open main menu'
  );
  overlay.toggleAttribute('hidden', isExpanded);
});

btnBookmark.addEventListener('click', () => {
  const isBookmarked = JSON.parse(localStorage.getItem('bookmark')) || false;
  toggleBookmark(!isBookmarked);
});

pledgeCards.forEach((card) => {
  const title = card.querySelector('#pledgeTitle').textContent;
  const amount = card.querySelector('#pledgeAmount').textContent;
  const message = card.querySelector('#pledgeMessage').textContent;
  const count = Number(card.querySelector('#pledgeCount').textContent);

  const dollarAmount = Number(amount.match(/\$(\d+)/)[1]);

  const pledgeHTML = ` 
        <li class="card flow ${count === 0 ? 'card--out-of-stock' : ''}" 
            data-id="${dollarAmount}" data-count="${count}">
          <div class="card-grid">
            <input type="radio" name="pledge" id="pledge-${dollarAmount}" 
               ${count === 0 ? 'disabled' : ''}/>
            <div class="flex-group ln-tight">
              <label for="pledge-${dollarAmount}" class="form-control heading-sm fw-bold">
                ${title}
              </label>
              <span class="primary-accent fw-medium">${amount}</span>
            </div>
            <h4><span class="count text-horizontal pledge-count">${count}</span>
              <span class="text-x-sm primary-color fw-regular">left</span>
            </h4>
            <p class="text-sm">${message}</p>
          </div>
        </li>`;

  modalList.insertAdjacentHTML('beforeend', pledgeHTML);
});

pledgeList.addEventListener('click', (e) => {
  if (e.target.matches('button')) {
    const card = e.target.closest('.card');
    const { id } = card.dataset;

    // Open pledge modal
    togglePledgeModal();

    const modalRadio = document.querySelector(
      `.modal input[id="pledge-${id}"]`
    );

    if (modalRadio && !modalRadio.disabled) {
      modalRadio.checked = true;
      // Trigger a click event to show the pledge form
      modalRadio.click();

      // Scroll the selected card into view
      const modalCard = modalRadio.closest('.card');
      modalCard.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }
});

btnCloseModal.addEventListener('click', closeModal);

btnBackProject.addEventListener('click', togglePledgeModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hasAttribute('hidden')) togglePledgeModal();
});

modalList.addEventListener('click', (e) => {
  if (e.target.matches('input[type="radio"]')) {
    const card = e.target.closest('.card');
    if (!card) return;

    const { id, count } = card.dataset;

    // Remove any existing pledge containers
    resetPledgeContainer();

    // HTML to inject when radio is selected
    const pledgeHTML = `
      <div class="pledge-container">
        <form class="pledge-form" data-pledge-id='${id}' data-current-count='${count}' >
          <label for="amount" class="text-sm primary-color">
            Enter your pledge
          </label>
          <div class="flex-group">
            <div class="pledge-input">
              <span class="currency" aria-hidden="true"> $ </span>
              <input 
                type="number" 
                name="amount" 
                id="amount" 
                value="${id}" 
                min="${id}" 
                required />
            </div>
            <button type="submit" class="button button--continue btnContinue">
                Continue
            </button>
          </div>
        </form>
      </div> `;

    // Add new pledge container to selected card
    card.insertAdjacentHTML('beforeend', pledgeHTML);
  }
});

document.addEventListener('submit', (e) => {
  if (e.target.matches('.pledge-form')) {
    e.preventDefault();
    const form = e.target;
    const { pledgeId, currentCount } = form.dataset;
    const amountPledged = Number(document.getElementById('amount').value);
    const goalAmount = 100000;

    if (currentCount > 0) {
      const newCount = currentCount - 1;

      if (pledgeData.backed >= goalAmount) {
        updateModalMessage('alreadyReached');
        return; // Exit early - no more pledges accepted
      }

      // Update backers and backed amount
      pledgeData.backers++;
      pledgeData.backed += amountPledged;

      // Save the updated data
      savePledge(pledgeId, newCount);

      // Update UI elements
      updatePledge(pledgeId, newCount, 0);

      // Calculate progress and update progress
      const progress = calculateProgress(pledgeData.backed);
      updateProgressBar(progress);

      // Show appropriate modal based on progress
      if (progress >= 100) updateModalMessage('goalReached');
      else updateModalMessage();
    }
  }
});

btnDismiss.addEventListener('click', () => {
  // Dismiss the message modal
  renderMessageModal();

  // Clean up any existing pledge forms & uncheck any selected radio buttons
  reset();

  // Finally close the main modal
  togglePledgeModal();
});

const init = function () {
  // Load saved pledgeData from localStorage
  const savedPledgeData = JSON.parse(localStorage.getItem('pledgeData'));
  if (savedPledgeData) {
    pledgeData.backed = savedPledgeData.backed;
    pledgeData.backers = savedPledgeData.backers;
    pledgeData.days = savedPledgeData.days;

    // Update data attributes
    backed.dataset.backed = pledgeData.backed;
    backers.dataset.backers = pledgeData.backers;
    daysLeft.dataset.days = pledgeData.days;
  }

  // Load saved counts from localStorage
  const pledgeCounts = JSON.parse(localStorage.getItem('pledgeCounts') || '{}');

  // Update UI with saved counts
  Object.entries(pledgeCounts).forEach(([pledgeId, count]) => {
    updatePledge(pledgeId, count, 0);
  });

  // Initialize UI with animated values
  displayStats(backed, pledgeData.backed);
  displayStats(backers, pledgeData.backers);
  displayStats(daysLeft, pledgeData.days);

  // Load bookmark state from localstorage
  const saved = JSON.parse(localStorage.getItem('bookmark')) || false;
  toggleBookmark(saved);

  // Set initial progress
  const initialProgress = calculateProgress(pledgeData.backed);
  updateProgressBar(initialProgress, true);
};

init();
