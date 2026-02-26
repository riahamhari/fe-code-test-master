// ---------------------------------------------------------------------------
// Embedded fallback data (mirrors data/*.json)
// ---------------------------------------------------------------------------

const TOPICS_FALLBACK = {
  title: "What interests you?",
  subtitle:
    "Select your favourite topics and we'll recommend what to explore next. Tag your interests with a star",
  choices: [
    {
      id: "news",
      title: "News & Current Affairs",
      description:
        "Stay informed with politics and the environment, plus the latest from the US.",
    },
    {
      id: "lifestyle",
      title: "Lifestyle & Luxury",
      description:
        "Discover fashion trends, travel inspiration, restaurant reviews and tips for living in style.",
    },
    {
      id: "puzzles",
      title: "Puzzle & Crosswords",
      description:
        "Challenge yourself with our best crossword clues and quiz questions, plus insights from our puzzles editor.",
    },
    {
      id: "sports",
      title: "Sports",
      description:
        "From football to Wimbledon, enjoy exclusive updates and coverage of top events.",
    },
    {
      id: "arts",
      title: "Arts & Culture",
      description:
        "Explore books, theatre, and TV with expert reviews and recommendations.",
    },
    {
      id: "business",
      title: "Business & Money",
      description:
        "Expert advice on personal finance, property, and insights for entrepreneurs",
    },
  ],
};

const NEWSLETTERS_FALLBACK = {
  title: "Your personal newsletter recommendations",
  subtitle:
    "Based on your interests, we recommend these email newsletters. Written by our journalists, select those you would like to receive.",
  choices: [
    {
      id: "environment",
      title: "Environment",
      frequency: "WEEKLY",
      description:
        "The latest climate news, book and podcast reviews and reasons to be cheerful.",
    },
    {
      id: "politics",
      title: "Politics",
      frequency: "DAILY",
      description:
        "Our insider's guide to Westminster, plus a rundown of PMQs every Wednesday.",
    },
    {
      id: "us",
      title: "US",
      frequency: "WEEKLY",
      description:
        "A balanced, fair and fact-checked take on global news and culture for our US readers.",
    },
    {
      id: "ireland",
      title: "Ireland",
      frequency: "WEEKLY",
      description:
        "The week's biggest stories from the Ireland edition of The Times and The Sunday Times.",
    },
    {
      id: "scotland",
      title: "Scotland",
      frequency: "WEEKLY",
      description:
        "Your weekend briefing from the Scotland edition of The Times and The Sunday Times.",
    },
    {
      id: "fashion",
      title: "Fashion",
      frequency: "WEEKLY",
      description:
        "Look good and feel great with the latest tips and trends from our fashion team.",
    },
    {
      id: "luxury",
      title: "Luxury",
      frequency: "WEEKLY",
      description:
        "The inside track on tech, travel, philanthropy and the hottest handbags, cars and spas.",
    },
    {
      id: "travel",
      title: "Travel",
      frequency: "WEEKLY",
      description:
        "Get inspiration for your next trip and a great deal thanks to our carefully curated offers.",
    },
  ],
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const state = {
  step: 1,
  selectedTopics: new Set(),
  selectedNewsletters: new Set(),
};

let topicsData = null;
let newslettersData = null;

const els = {
  backBtn: document.getElementById("back-btn"),
  nextBtn: document.getElementById("next-btn"),
  stepLabel: document.getElementById("step-label"),
  progressFill: document.getElementById("progress-fill"),
  progressBar: document.querySelector('[role="progressbar"]'),
  main: document.getElementById("main-content"),
};

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

async function fetchOnboardingData() {
  try {
    const [topicsRes, newslettersRes] = await Promise.all([
      fetch("data/topics.json"),
      fetch("data/newsletters.json"),
    ]);

    if (!topicsRes.ok || !newslettersRes.ok) {
      throw new Error("Failed to load JSON");
    }
    const [topics, newsletters] = await Promise.all([
      topicsRes.json(),
      newslettersRes.json(),
    ]);

    topicsData = topics;
    newslettersData = newsletters;
  } catch (error) {
    topicsData = TOPICS_FALLBACK;
    newslettersData = NEWSLETTERS_FALLBACK;
  }
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

function setupNavigation() {
  els.backBtn.addEventListener("click", () => {
    if (state.step > 1) {
      state.step--;
      renderCurrentStep();
    }
  });

  els.nextBtn.addEventListener("click", () => {
    if (state.step < 3) {
      state.step++;
      renderCurrentStep();
    }
  });
}

/**
 * Renders the UI for the current onboarding step.
 *
 * Responsibilities:
 * - Updates navigation UI (step label, progress bar, button visibility)
 * - Renders the appropriate page content based on state.step
 * - Attaches card interaction handlers for selection steps
 *
 * This function derives all UI from the single source of truth: `state`.
 * It should be called whenever `state.step` changes.
 */ function renderCurrentStep() {
  const { step } = state;
  const isFirstStep = step === 1;
  const isLastStep = step === 3;
  const { stepLabel, progressFill, progressBar, backBtn, nextBtn, main } = els;

  // Nav UI
  const percentVal = Math.round((step / 3) * 100);
  stepLabel.textContent = `Step ${step} of 3`;
  progressFill.style.width = `${percentVal}%`;
  progressBar.setAttribute("aria-valuenow", `${percentVal}`);

  backBtn.classList.toggle("is-hidden", isFirstStep);
  nextBtn.classList.toggle("is-hidden", isLastStep);

  // Summary has no cards
  if (isLastStep) {
    main.innerHTML = renderSummaryPage();
    return;
  }

  main.innerHTML = isFirstStep
    ? renderSelectionPage(topicsData, state.selectedTopics)
    : renderSelectionPage(newslettersData, state.selectedNewsletters);

  attachCardListeners();
}

/**
 * adds click and keydown event listeners to cards to toggle select/unselect
 */
function attachCardListeners() {
  const cards = [...els.main.querySelectorAll(".card")];
  cards.forEach((card) => {
    card.addEventListener("click", () => toggleCard(card));

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        toggleCard(card);
      }
    });
  });
}

function toggleCard(card) {
  const id = card.dataset.id;
  const selection =
    state.step === 1 ? state.selectedTopics : state.selectedNewsletters;

  if (selection.has(id)) {
    selection.delete(id);
    card.setAttribute("aria-checked", "false");
  } else {
    selection.add(id);
    card.setAttribute("aria-checked", "true");
  }
}

// ---------------------------------------------------------------------------
// SVG assets
// ---------------------------------------------------------------------------

const STAR_SVG = `<svg class="card-star" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
<path d="M14.7249 8.15612C16.2754 7.23788 17.0507 6.77876 17.6201 7.10452C18.1895 7.43027 18.1758 8.32517 18.1486 10.115L18.1416 10.578C18.1339 11.0866 18.13 11.3409 18.2248 11.5644C18.3196 11.7878 18.5023 11.9552 18.8677 12.2899L19.2003 12.5946C20.4862 13.7725 21.1291 14.3614 20.9784 15.0228C20.8277 15.6841 19.9831 15.9799 18.2941 16.5714L17.8571 16.7245C17.3771 16.8926 17.1371 16.9766 16.953 17.1451C16.7689 17.3137 16.6615 17.5476 16.4467 18.0153L16.2512 18.4412C15.4953 20.0874 15.1174 20.9105 14.4549 20.9935C13.7924 21.0765 13.284 20.3644 12.2673 18.9402L12.0043 18.5717C11.7154 18.167 11.5709 17.9647 11.3623 17.8453C11.1538 17.726 10.9047 17.7032 10.4065 17.6576L9.95303 17.6161C8.20005 17.4557 7.32356 17.3754 7.06482 16.7654C6.80608 16.1553 7.33644 15.4194 8.39716 13.9477L8.67158 13.5669C8.973 13.1487 9.12372 12.9396 9.17893 12.6973C9.23414 12.4551 9.18759 12.2071 9.09451 11.7111L9.00976 11.2596C8.68219 9.51421 8.51841 8.64154 9.02101 8.18152C9.52362 7.7215 10.3598 7.9788 12.032 8.49339L12.4647 8.62652C12.9399 8.77276 13.1775 8.84587 13.4202 8.81547C13.6629 8.78508 13.8832 8.65461 14.3238 8.39368L14.7249 8.15612Z" fill="#1C274C"/>
<path opacity="0.5" fill-rule="evenodd" clip-rule="evenodd" d="M8.96967 1.96967C9.26256 1.67678 9.73744 1.67678 10.0303 1.96967L12.0303 3.96967C12.3232 4.26256 12.3232 4.73744 12.0303 5.03033C11.7374 5.32322 11.2626 5.32322 10.9697 5.03033L8.96967 3.03033C8.67678 2.73744 8.67678 2.26256 8.96967 1.96967ZM3.46967 3.46967C3.76256 3.17678 4.23744 3.17678 4.53033 3.46967L7.03033 5.96967C7.32322 6.26256 7.32322 6.73744 7.03033 7.03033C6.73744 7.32322 6.26256 7.32322 5.96967 7.03033L3.46967 4.53033C3.17678 4.23744 3.17678 3.76256 3.46967 3.46967ZM12.4697 5.46967C12.7626 5.17678 13.2374 5.17678 13.5303 5.46967L14.0303 5.96967C14.3232 6.26256 14.3232 6.73744 14.0303 7.03033C13.7374 7.32322 13.2626 7.32322 12.9697 7.03033L12.4697 6.53033C12.1768 6.23744 12.1768 5.76256 12.4697 5.46967ZM1.46967 7.46967C1.76256 7.17678 2.23744 7.17678 2.53033 7.46967L3.03033 7.96967C3.32322 8.26256 3.32322 8.73744 3.03033 9.03033C2.73744 9.32322 2.26256 9.32322 1.96967 9.03033L1.46967 8.53033C1.17678 8.23744 1.17678 7.76256 1.46967 7.46967ZM3.96967 9.96967C4.26256 9.67678 4.73744 9.67678 5.03033 9.96967L6.53033 11.4697C6.82322 11.7626 6.82322 12.2374 6.53033 12.5303C6.23744 12.8232 5.76256 12.8232 5.46967 12.5303L3.96967 11.0303C3.67678 10.7374 3.67678 10.2626 3.96967 9.96967Z" fill="#1C274C"/>
</svg>`;

// ---------------------------------------------------------------------------
// Page renderers
// ---------------------------------------------------------------------------

/**
 * Renders the topics or newsletters selection page.
 * @param {object} data  - Parsed JSON from topics.json or newsletters.json
 * @param {Set}    selected - The active selection Set
 */
function renderSelectionPage(data, selected) {
  const cards = data.choices
    .map((choice) => {
      const isSelected = selected.has(choice.id);

      const badge = choice.frequency
        ? `<span class="card-badge">${choice.frequency}</span>`
        : "";

      return `
        <article
          class="card"
          role="checkbox"
          aria-checked="${isSelected}"
          tabindex="0"
          data-id="${choice.id}"
        >
          ${badge}
          <h3 class="card-title">${choice.title}</h3>
          <p class="card-description">${choice.description}</p>
          ${STAR_SVG}
        </article>`;
    })
    .join("");

  return `
    <div class="page-heading">
      <h1 class="page-title">${data.title}</h1>
      <p class="page-subtitle">${data.subtitle}</p>
    </div>
    <div
      class="card-grid"
      role="group"
      aria-label="${data.title}"
    >
      ${cards}
    </div>`;
}

/**
 * Renders the summary / thank-you page.
 */
function renderSummaryPage() {
  const topicItems = buildSummaryItems(
    state.selectedTopics,
    topicsData.choices,
  );
  const newsletterItems = buildSummaryItems(
    state.selectedNewsletters,
    newslettersData.choices,
  );

  return `
    <div class="summary-heading">
      <h1 class="summary-title">Thanks for your submission</h1>
      <p class="summary-subtitle">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia et.
      </p>
    </div>

    <div class="summary-panels">
      <section class="summary-panel" aria-label="Your selected topics">
        <p class="summary-panel-label">Your topics</p>
        ${
          topicItems.length
            ? `<ul class="summary-list">${topicItems.join("")}</ul>`
            : '<p class="summary-empty">No topics selected</p>'
        }
      </section>

      <section class="summary-panel" aria-label="Your selected newsletters">
        <p class="summary-panel-label">Your newsletters</p>
        ${
          newsletterItems.length
            ? `<ul class="summary-list">${newsletterItems.join("")}</ul>`
            : '<p class="summary-empty">No newsletters selected</p>'
        }
      </section>
    </div>`;
}

/**
 * Returns an array of <li> HTML strings for selected items.
 */
function buildSummaryItems(selectedIds, choices) {
  return [...selectedIds]
    .map((id) => {
      const choice = choices.find((c) => c.id === id);
      return choice ? `<li class="summary-item">${choice.title}</li>` : null;
    })
    .filter(Boolean);
}

async function init() {
  await fetchOnboardingData();
  setupNavigation();

  renderCurrentStep();
}

init();
