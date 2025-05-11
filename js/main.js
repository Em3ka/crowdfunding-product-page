const btnBackProject = document.querySelector('.btn-back-project');
const btnBookmark = document.querySelector('.btn-bookmark');
const modal = document.querySelector('.modal');
const cardContainer = document.querySelector('.modal .card-group');
const closeModal = document.querySelector(' .close-modal');
const successModal = document.querySelector('.success-modal');
const btnDismiss = document.querySelector('.button-dismiss');
const overlay = document.querySelector('.overlay');

const toggleModal = function () {
  const isHidden = modal.hasAttribute('hidden');

  modal.toggleAttribute('hidden', !isHidden);
  overlay.toggleAttribute('hidden', !isHidden);
  document.body.classList.toggle('no-scroll', isHidden);
};

closeModal.addEventListener('click', toggleModal);
btnBackProject.addEventListener('click', toggleModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hasAttribute('hidden')) toggleModal();
});

cardContainer.addEventListener('click', (e) => {
  if (e.target.matches('input[type="radio"]')) {
    const card = e.target.closest('.card');
    if (!card) return;

    // Get the default pledge amount
    const { amount } = card.dataset;

    // Remove any existing pledge containers
    document.querySelectorAll('.pledge-container').forEach((container) => {
      container.remove();
    });

    // HTML to inject when radio is selected
    const pledgeHTML = `
      <div class="pledge-container">
        <form class="pledge-form">
          <label for="amount" class="text-sm primary-color">
            Enter your pledge
          </label>
          <div class="flex-group">
            <div class="pledge-input">
              <span class="currency" aria-hidden="true"> $ </span>
              <input type="number" name="amount" id="amount" value="${amount}" />
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
    toggleSuccessDialog();
  }
});

const toggleSuccessDialog = function () {
  const isHidden = successModal.hasAttribute('hidden');
  successModal.toggleAttribute('hidden', !isHidden);
};

btnDismiss.addEventListener('click', () => {
  toggleSuccessDialog();
  toggleModal();
});
