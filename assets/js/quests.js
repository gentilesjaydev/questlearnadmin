document.addEventListener("DOMContentLoaded", function() {
    const questsContainer = document.getElementById('questsContainer');
    const categorySelect = document.getElementById('categorySelect');
    const levelSelect = document.getElementById('levelSelect');
    const addQuestBtn = document.getElementById('addQuestBtn');
    
    if(!questsContainer) return;

    let currentCategory = categorySelect.value;
    let currentLevel = parseInt(levelSelect.value);

    questsContainer.innerHTML = '<div class="col-12 text-center text-muted py-5"><i class="fa-solid fa-circle-notch fa-spin fa-2x mb-3 text-primary"></i><br>Checking Authentication...</div>';

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadQuestions();

            categorySelect.addEventListener('change', (e) => {
                currentCategory = e.target.value;
                loadQuestions();
            });

            levelSelect.addEventListener('change', (e) => {
                currentLevel = parseInt(e.target.value);
                loadQuestions();
            });

            addQuestBtn.addEventListener('click', () => {
                openAddQuestionModal(currentCategory, currentLevel);
            });
            
        } else {
            questsContainer.innerHTML = `
            <div class="col-12 text-center text-danger p-5">
                <i class="fa-solid fa-lock fa-3x mb-3"></i>
                <h5>Authentication Required</h5>
                <p>You must be logged in to Firebase to view live quests.</p>
            </div>`;
        }
    });

    function getCategoryPath(category) {
        const map = {
            'boss_battle': 'bosses',
            'challenge': 'rounds',
            'daily': 'days',
            'puzzle': 'levels',
            'review': 'sessions',
            'story': 'chapters',
            'timed': 'stages'
        };
        return map[category] || 'questions';
    }

    function loadQuestions() {
        questsContainer.innerHTML = '<div class="col-12 text-center text-muted py-5"><i class="fa-solid fa-circle-notch fa-spin fa-2x mb-3 text-primary"></i><br>Loading Game Content...</div>';
        
        const pathNode = getCategoryPath(currentCategory);
        
        // --- Database Self-Healing Logic ---
        db.ref(`quests/${currentCategory}/${pathNode}`).once('value').then(async (snap) => {
            const rawData = snap.val();
            if (rawData && !Array.isArray(rawData)) {
                let hasStringKeys = false;
                let cleanArray = [];
                Object.keys(rawData).forEach(k => {
                    if (isNaN(parseInt(k)) || k.includes('-')) hasStringKeys = true;
                    if (rawData[k]) cleanArray.push(rawData[k]);
                });
                
                if (hasStringKeys) {
                    console.log(`[Auto-Heal] Repairing corrupted array structure in ${currentCategory}...`);
                    await db.ref(`quests/${currentCategory}/${pathNode}`).set(cleanArray);
                }
            }
        });
        // -----------------------------------

        db.ref(`quests/${currentCategory}/${pathNode}`).on('value', (snapshot) => {
            questsContainer.innerHTML = ''; 
            const data = snapshot.val();
            
            console.log("Firebase Data for", currentCategory, ":", data);
            let hasQuestions = false;
            
            if (data) {
                Object.keys(data).forEach(key => {
                    const q = data[key];
                    if (!q) return; 
                    
                    if (parseInt(q.level) === currentLevel) {
                        hasQuestions = true;
                        
                        let promptText = 'No Prompt';
                        let answerText = 'No Answer';
                        let choicesText = '';
                        let reward = q.hpReward || 0;
                        let penalty = q.hpPenalty || 0;
                        
                        // Parse complex nested structures based on category
                        switch(currentCategory) {
                            case 'boss_battle':
                                promptText = `Boss: ${q.bossName || 'Unnamed'}`;
                                answerText = `Max HP: ${q.maxHp || 0}`;
                                choicesText = `<strong>Tagline:</strong> ${q.bossTagline || 'N/A'}<br><strong>Attacks:</strong> ${q.attacks ? q.attacks.length : 0}`;
                                if(q.attacks && q.attacks[0]) {
                                    reward = q.attacks[0].damage || 0; // Using damage as penalty representation
                                    penalty = q.attacks[0].damage || 0;
                                }
                                break;
                            case 'challenge':
                                promptText = `Round: ${q.roundTitle || 'N/A'}`;
                                answerText = `Difficulty: ${q.difficulty || 'N/A'}`;
                                choicesText = `<strong>Subtitle:</strong> ${q.subtitle || 'N/A'}<br><strong>Challenges:</strong> ${q.challenges ? q.challenges.length : 0}`;
                                break;
                            case 'daily':
                                promptText = `${q.dayLabel || 'Day'}: ${q.title || 'N/A'}`;
                                answerText = `Target: ${q.targetCount || 0}`;
                                choicesText = `<strong>Desc:</strong> ${q.description || 'N/A'}<br><strong>Questions:</strong> ${q.questions ? q.questions.length : 0}`;
                                break;
                            case 'puzzle':
                                promptText = `Puzzle Level ${q.level}`;
                                answerText = `Words: ${q.words ? q.words.length : 0}`;
                                choicesText = `<strong>Letter Bank:</strong> ${q.letterBank || 'N/A'}`;
                                if(q.words && q.words[0]) {
                                    reward = q.words[0].hpReward || 0;
                                    penalty = q.words[0].hpPenalty || 0;
                                }
                                break;
                            case 'review':
                                promptText = `Session: ${q.sessionTitle || 'N/A'}`;
                                answerText = `Items: ${q.items ? q.items.length : 0}`;
                                choicesText = `<strong>Desc:</strong> ${q.description || 'N/A'}`;
                                break;
                            case 'story':
                                promptText = `Chapter: ${q.chapterTitle || 'N/A'}`;
                                answerText = `Steps: ${q.steps ? q.steps.length : 0}`;
                                choicesText = `<strong>Location:</strong> ${q.location || 'N/A'}<br><strong>Intro:</strong> ${q.introPassage || 'N/A'}`;
                                break;
                            case 'timed':
                                promptText = `Stage: ${q.stageTitle || 'N/A'}`;
                                answerText = `Questions: ${q.questions ? q.questions.length : 0}`;
                                choicesText = `<strong>Default Time:</strong> ${q.defaultSeconds || 0}s`;
                                break;
                            default:
                                promptText = q.incorrectSentence || q.word || q.question || 'No Prompt';
                                answerText = q.correctSentence || q.correctAnswer || 'No Answer';
                                choicesText = `<strong>Choices/Info:</strong><br>${(q.explanation || q.storyPassage || q.question || 'No Info').replace(/\n/g, '<br>')}`;
                                break;
                        }
                        
                        const cardHtml = `
                        <div class="col-md-6 col-xl-4 mb-4">
                            <div class="card h-100 p-4 border-top border-primary border-4 shadow-sm" style="border-radius: 16px;">
                                <div class="d-flex justify-content-between align-items-start mb-3">
                                    <div class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold border border-primary border-opacity-25">
                                        <i class="fa-solid fa-bolt me-1"></i> Level ${currentLevel}
                                    </div>
                                    <div class="text-muted fw-bold small text-truncate ms-2" style="max-width: 120px;" title="${key}">ID: ${key}</div>
                                </div>
                                <h5 class="fw-bold text-dark mt-2 mb-3">${promptText}</h5>
                                
                                <div class="bg-light p-3 rounded-3 mb-4 small text-muted" style="border: 1px solid var(--border-color);">
                                    ${choicesText}
                                </div>
                                
                                <p class="mb-3 text-dark fw-medium"><i class="fa-solid fa-check text-success me-2"></i> ${answerText}</p>
                                
                                <div class="mt-auto d-flex justify-content-between align-items-center border-top pt-3">
                                    <div class="d-flex gap-3">
                                        <span class="fw-bold small text-success" title="HP Reward"><i class="fa-solid fa-heart-circle-plus"></i> +${reward}</span>
                                        <span class="fw-bold small text-danger" title="HP Penalty"><i class="fa-solid fa-heart-crack"></i> -${penalty}</span>
                                    </div>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-light rounded-3 shadow-sm border" onclick="deleteQuestion('${currentCategory}', '${key}')"><i class="fa-solid fa-trash text-danger"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
                        questsContainer.innerHTML += cardHtml;
                    }
                });
            } 
            
            if (!hasQuestions) {
                questsContainer.innerHTML = `
                    <div class="col-12 text-center text-muted p-5">
                        <i class="fa-solid fa-folder-open fa-3x mb-3 text-secondary opacity-50"></i>
                        <h5>No Game Data Found</h5>
                        <p>There are no active records for <strong>${currentCategory.toUpperCase()} - Level ${currentLevel}</strong> yet.</p>
                    </div>`;
            }
        }, (error) => {
            questsContainer.innerHTML = `<div class="col-12 text-center text-danger p-5"><i class="fa-solid fa-triangle-exclamation fa-3x mb-3"></i><h5>Error</h5><p>${error.message}</p></div>`;
        });
    }

    function openAddQuestionModal(category, level) {
        // Determine input labels based on category
        let promptLabel = "Question / Prompt";
        let answerLabel = "Correct Answer";
        let choicesLabel = "Choices / Explanation";
        
        if(category === 'grammar' || category === 'information_literacy') {
            promptLabel = "Question Sentence (incorrectSentence)";
            answerLabel = "Correct Option (correctSentence)";
            choicesLabel = "Choices (explanation)";
        } else if(category === 'vocabulary') {
            promptLabel = "Word / Question (word)";
            answerLabel = "Correct Option (correctAnswer)";
            choicesLabel = "Choices (question)";
        } else if(category === 'reading') {
            promptLabel = "Question (question)";
            answerLabel = "Correct Option (correctAnswer)";
            choicesLabel = "Story Passage (storyPassage)";
        } else if(category === 'spelling') {
            promptLabel = "Audio/Prompt (question)";
            answerLabel = "Correct Word (correctAnswer)";
            choicesLabel = "Word to spell (word)";
        }

        Swal.fire({
            title: `Add ${category.toUpperCase()} Question`,
            html: `
                <div class="text-start">
                    <div class="badge bg-primary mb-3">Level ${level}</div>
                    
                    <label class="form-label text-muted small fw-bold mb-1">${promptLabel}</label>
                    <input id="q-prompt" class="swal2-input m-0 mb-3 w-100" placeholder="Enter question...">
                    
                    <label class="form-label text-muted small fw-bold mb-1">${choicesLabel}</label>
                    <textarea id="q-choices" class="swal2-textarea m-0 mb-3 w-100" placeholder="Enter choices separated by newlines..."></textarea>
                    
                    <label class="form-label text-muted small fw-bold mb-1">${answerLabel}</label>
                    <input id="q-answer" class="swal2-input m-0 mb-3 w-100" placeholder="e.g. A, B, or exact word">
                    
                    <div class="row">
                        <div class="col-6">
                            <label class="form-label text-muted small fw-bold mb-1">HP Reward (+)</label>
                            <input id="q-reward" type="number" class="swal2-input m-0 w-100" value="15">
                        </div>
                        <div class="col-6">
                            <label class="form-label text-muted small fw-bold mb-1">HP Penalty (-)</label>
                            <input id="q-penalty" type="number" class="swal2-input m-0 w-100" value="10">
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            confirmButtonText: 'Save Question',
            preConfirm: () => {
                const prompt = document.getElementById('q-prompt').value.trim();
                const choices = document.getElementById('q-choices').value.trim();
                const answer = document.getElementById('q-answer').value.trim();
                const reward = parseInt(document.getElementById('q-reward').value) || 0;
                const penalty = parseInt(document.getElementById('q-penalty').value) || 0;
                
                if(!prompt || !answer) {
                    Swal.showValidationMessage('Prompt and Answer are required!');
                    return false;
                }
                
                // Construct the object dynamically based on category requirements
                let newQuestion = {
                    level: level,
                    hpReward: reward,
                    hpPenalty: penalty,
                    id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5)
                };
                
                if(category === 'grammar' || category === 'information_literacy') {
                    newQuestion.incorrectSentence = prompt;
                    newQuestion.correctSentence = answer;
                    newQuestion.explanation = choices;
                } else if(category === 'vocabulary') {
                    newQuestion.word = prompt;
                    newQuestion.correctAnswer = answer;
                    newQuestion.question = choices;
                } else if(category === 'reading') {
                    newQuestion.question = prompt;
                    newQuestion.correctAnswer = answer;
                    newQuestion.storyPassage = choices;
                    newQuestion.storyTitle = "New Story";
                } else if(category === 'spelling') {
                    newQuestion.question = prompt;
                    newQuestion.correctAnswer = answer;
                    newQuestion.word = choices;
                } else if(category === 'boss_battle') {
                    newQuestion.bossName = prompt;
                    newQuestion.maxHp = parseInt(answer) || 100;
                    newQuestion.bossTagline = choices;
                    newQuestion.attacks = [{ damage: penalty, question: "Default Attack", correctAnswer: "N/A" }];
                } else if(category === 'challenge') {
                    newQuestion.roundTitle = prompt;
                    newQuestion.difficulty = answer;
                    newQuestion.subtitle = choices;
                    newQuestion.challenges = [{ type: "wordscape", words: ["example"] }];
                } else if(category === 'daily') {
                    newQuestion.title = prompt;
                    newQuestion.targetCount = parseInt(answer) || 5;
                    newQuestion.description = choices;
                    newQuestion.questions = [{ question: "Sample", correctAnswer: "Ans" }];
                } else if(category === 'puzzle') {
                    newQuestion.letterBank = choices || "ABCDE";
                    newQuestion.words = [{ word: prompt, hpReward: reward, hpPenalty: penalty }];
                } else if(category === 'review') {
                    newQuestion.sessionTitle = prompt;
                    newQuestion.description = choices;
                    newQuestion.items = [];
                } else if(category === 'story') {
                    newQuestion.chapterTitle = prompt;
                    newQuestion.location = answer;
                    newQuestion.introPassage = choices;
                    newQuestion.steps = [];
                } else if(category === 'timed') {
                    newQuestion.stageTitle = prompt;
                    newQuestion.defaultSeconds = parseInt(answer) || 30;
                    newQuestion.questions = [];
                } else {
                    // Fallback generic
                    newQuestion.question = prompt;
                    newQuestion.correctAnswer = answer;
                    newQuestion.explanation = choices;
                }

                return newQuestion;
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const pathNode = getCategoryPath(category);
                    const nodePath = `quests/${category}/${pathNode}`;
                    
                    const snapshot = await db.ref(nodePath).once('value');
                    const data = snapshot.val();
                    let nextIndex = 0;
                    if (Array.isArray(data)) {
                        nextIndex = data.length;
                    } else if (data) {
                        const keys = Object.keys(data);
                        let maxInt = -1;
                        keys.forEach(k => {
                            const parsed = parseInt(k);
                            if (!isNaN(parsed) && parsed > maxInt) maxInt = parsed;
                        });
                        nextIndex = maxInt + 1;
                    }

                    await db.ref(`${nodePath}/${nextIndex}`).set(result.value);
                    if (typeof Toast !== 'undefined') Toast.fire({ icon: 'success', title: 'Data added successfully!' });
                } catch (err) {
                    Swal.fire('Error', err.message, 'error');
                }
            }
        });
    }
});

// Delete function attached to window for inline onclick access
window.deleteQuestion = function(category, key) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Delete Data?',
            text: "Are you sure you want to permanently delete this game node?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                // We need to use the getCategoryPath logic to delete the right node
                const map = {
                    'boss_battle': 'bosses',
                    'challenge': 'rounds',
                    'daily': 'days',
                    'puzzle': 'levels',
                    'review': 'sessions',
                    'story': 'chapters',
                    'timed': 'stages'
                };
                const pathNode = map[category] || 'questions';
                
                db.ref(`quests/${category}/${pathNode}/${key}`).remove()
                    .then(() => {
                        if(typeof Toast !== 'undefined') Toast.fire({ icon: 'success', title: 'Data deleted' });
                    })
                    .catch(err => Swal.fire("Error", "Could not delete: " + err.message, "error"));
            }
        });
    }
};
