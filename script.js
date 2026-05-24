document.addEventListener('DOMContentLoaded', () => {
    // Easily add, remove, or modify dealbreakers here
    const DEALBREAKERS_DATA = [
        { label: "Microtransactions / P2W", description: "Real-money shops, pay-to-win elements, or severe progression roadblocks designed to force purchases." },
        { label: "Gacha / Loot Boxes", description: "Randomized reward drops, gambling mechanics, or character rolling systems using premium currency." },
        { label: "Always Online Requirement", description: "Requires a constant internet connection even when playing entirely solo or in single-player modes." },
        { label: "Permadeath / Progression Loss", description: "Losing characters, equipment, or hours of meta-progression permanently upon a single death." },
        { label: "Excessive Grind / Time-gating", description: "Repetitive tasks required to progress or content locked behind real-world daily/weekly timers." },
        { label: "Souls-like / Punishing Combat", description: "Extremely high difficulty, strict animation framing, and massive penalties for combat mistakes." },
        { label: "Jump Scares / Horror Focus", description: "Sudden flashing images, loud shocking noises, or an intense psychological horror atmosphere." },
        { label: "Long / Unskippable Cutscenes", description: "Forced movie sequences, long unskippable dialogue boxes, more movie than game, or massive text-heavy infodumps." },
        { label: "Fetch Quests Fatigue", description: "Overreliance on endless back-and-forth item retrieval quests." },
        { label: "Open World Map Bloat", description: "Ubisoft-style map designs stuffed with hundreds of copy-pasted icons and checklists." },
        { label: "Quick Time Events (QTEs)", description: "Heavy reliance on sudden button prompts during cutscenes or cinematic gameplay sequences." },
        { label: "Low / No Checkpoints", description: "Bad checkpoints causing heavy repitition or progression loss that doesn't respect users time." },
        { label: "Getting Lost / Where to Go?", description: "Lack of clear direction, Lack of maps, easy to get lost without clue on where to go next." }
    ];

    const checkboxGrid = document.getElementById('checkbox-grid');
    const copyBtn = document.getElementById('copy-btn');
    const resetBtn = document.getElementById('reset-btn');
    const gameListInput = document.getElementById('game-list');
    const additionalInput = document.getElementById('additional-dealbreakers');
    const toast = document.getElementById('toast');

    // Dynamically render checkboxes from JSON data
    function renderDealbreakers() {
        checkboxGrid.innerHTML = ''; 
        DEALBREAKERS_DATA.forEach((db, index) => {
            const label = document.createElement('label');
            label.className = 'checkbox-container';
            label.setAttribute('data-tooltip', db.description);

            label.innerHTML = `
                <input type="checkbox" value="${db.label}" data-index="${index}">
                <span class="custom-checkbox"></span>
                <span class="checkbox-text">${db.label}</span>
            `;
            checkboxGrid.appendChild(label);
        });
    }

    // Save checked states and custom text inputs to localStorage
    function saveState() {
        const checkedIndices = [];
        const checkboxes = checkboxGrid.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(cb => {
            if (cb.checked) {
                checkedIndices.push(cb.getAttribute('data-index'));
            }
        });

        localStorage.setItem('dgg_checked_dealbreakers', JSON.stringify(checkedIndices));
        localStorage.setItem('dgg_custom_dealbreakers', additionalInput.value);
    }

    // Load preserved states back into the DOM on execution
    function loadState() {
        const savedCustomText = localStorage.getItem('dgg_custom_dealbreakers');
        if (savedCustomText !== null) {
            additionalInput.value = savedCustomText;
        }

        const savedCheckedIndices = JSON.parse(localStorage.getItem('dgg_checked_dealbreakers') || '[]');
        const checkboxes = checkboxGrid.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(cb => {
            const idx = cb.getAttribute('data-index');
            if (savedCheckedIndices.includes(idx)) {
                cb.checked = true;
            }
        });
    }

    // Initialize UI Layout Components
    renderDealbreakers();
    loadState();

    // Event listeners to handle real-time value tracking automatically
    checkboxGrid.addEventListener('change', saveState);
    additionalInput.addEventListener('input', saveState);

    // Copy Prompt Functionality
    copyBtn.addEventListener('click', () => {
        const gameNames = gameListInput.value.trim();
        
        if (!gameNames) {
            alert('Please add at least one game name to check for dealbreakers.');
            gameListInput.focus();
            return;
        }

        const selectedDealbreakers = [];
        const checkboxes = checkboxGrid.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(cb => {
            if (cb.checked) {
                const idx = parseInt(cb.getAttribute('data-index'), 10);
                const originalData = DEALBREAKERS_DATA[idx];
                // Pair both Title and Context Definition cleanly for the prompt engine
                selectedDealbreakers.push(`- ${originalData.label} (Defined as: ${originalData.description})`);
            }
        });

        const customDealbreakers = additionalInput.value.trim();
        if (customDealbreakers) {
            selectedDealbreakers.push(`- Custom Criteria: ${customDealbreakers}`);
        }

        if (selectedDealbreakers.length === 0) {
            alert('Please select at least one dealbreaker or add an additional one below.');
            return;
        }

        const computedPrompt = `You are a precise, data-driven video game research assistant. Your task is to evaluate if the following game(s) contain specific elements from my personal list of dealbreakers and provide a clear, highly readable overview.

Target Game(s) to Analyze:
${gameNames}

My List of Dealbreakers:
${selectedDealbreakers.join('\n')}

---

### Instructions for Response Formatting
To ensure the response is easy to read and digestible at a glance, strictly follow these structural guidelines. Avoid dense walls of text and keep paragraphs short. Use concise bullet points wherever possible.

#### 1. Game Overview & Community Consensus
For each game, start with a quick snapshot:
* **Game Summary:** A brief, engaging 2-3 sentence summary of the core gameplay loop and genre.
* **Community Consensus:** Provide an overall community sentiment rating inspired by Steam's system (e.g., "Overwhelmingly Positive," "Mostly Positive," "Mixed," or "Mostly Negative") based on current player and critic reviews.

#### 2. Dealbreaker Assessment
Analyze the game against my list of dealbreakers using web searches (expert reviews, Reddit, Steam discussions, etc.):
* If any dealbreakers are present, list them as short, specific bullet points explaining how they manifest (and if they can be toggled off/modded out).
* If absolutely no dealbreakers from the list are found in the game, simply state: **"No Dealbreakers Found."**

#### 3. Recommendation & Likelihood Verdict
Conclude with a final, direct assessment:
* Provide a percentage or probability of how likely I am to enjoy or dislike the game based on the intensity of the dealbreakers found versus the community reception. 
* Include a 1-2 sentence justification for this verdict.`;

        navigator.clipboard.writeText(computedPrompt).then(() => {
            showToast();
        }).catch(err => {
            console.error('Failed to copy prompt automatically: ', err);
            alert('Could not copy prompt automatically. Please check browser permissions.');
        });
    });

    // Reset System Configuration
    resetBtn.addEventListener('click', () => {
        gameListInput.value = '';
        additionalInput.value = '';
        const checkboxes = checkboxGrid.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
        
        localStorage.removeItem('dgg_checked_dealbreakers');
        localStorage.removeItem('dgg_custom_dealbreakers');
    });

    function showToast() {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});