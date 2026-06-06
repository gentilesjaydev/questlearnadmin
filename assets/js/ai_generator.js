// AI Curriculum Generator Logic

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

let extractedText = '';
let draftQuestions = [];

document.addEventListener('DOMContentLoaded', () => {
    const uploadZone = document.getElementById('pdfUploadZone');
    const fileInput = document.getElementById('moduleFileInput');
    const aiControls = document.getElementById('aiControls');
    const selectedFileName = document.getElementById('selectedFileName');
    const startAiBtn = document.getElementById('startAiBtn');

    const loadingState = document.getElementById('aiLoadingState');
    const emptyState = document.getElementById('aiEmptyState');
    const resultsList = document.getElementById('aiResultsList');
    const statusBadge = document.getElementById('aiStatusBadge');
    const publishAiBtn = document.getElementById('publishAiBtn');

    // Handle Drag and Drop
    uploadZone.addEventListener('click', () => {
        if (!document.getElementById('aiCategorySelect').value) {
            Swal.fire('Select Category', 'Please select a Target Category before uploading your module.', 'warning');
            return;
        }
        fileInput.click();
    });

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('bg-white', 'border-primary');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('bg-white', 'border-primary');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('bg-white', 'border-primary');
        if (!document.getElementById('aiCategorySelect').value) {
            Swal.fire('Select Category', 'Please select a Target Category before dropping your module.', 'warning');
            return;
        }
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect(fileInput.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileSelect(e.target.files[0]);
        }
    });

    function handleFileSelect(file) {
        if (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            Swal.fire('Invalid File', 'Please upload a PDF or DOCX document.', 'error');
            return;
        }

        selectedFileName.textContent = file.name;
        uploadZone.style.display = 'none';
        aiControls.style.display = 'block';
        statusBadge.textContent = 'Document loaded. Ready to generate.';
        statusBadge.className = 'badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill';

        // Extract text based on file type
        if (file.type === 'application/pdf') {
            extractTextFromPdf(file);
        } else {
            extractTextFromDocx(file);
        }
    }

    async function extractTextFromPdf(file) {
        const fileReader = new FileReader();
        fileReader.onload = async function () {
            const typedarray = new Uint8Array(this.result);
            try {
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';

                // Read up to first 10 pages to avoid massive token usage
                const maxPages = Math.min(pdf.numPages, 10);

                for (let i = 1; i <= maxPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n';
                }

                extractedText = fullText;
                console.log("Extracted PDF text length: ", extractedText.length);
            } catch (error) {
                console.error('Error reading PDF:', error);
                Swal.fire('Error', 'Could not parse the PDF file.', 'error');
            }
        };
        fileReader.readAsArrayBuffer(file);
    }

    async function extractTextFromDocx(file) {
        const fileReader = new FileReader();
        fileReader.onload = async function () {
            const arrayBuffer = this.result;
            try {
                const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                extractedText = result.value;
                console.log("Extracted DOCX text length: ", extractedText.length);
            } catch (error) {
                console.error('Error reading DOCX:', error);
                Swal.fire('Error', 'Could not parse the DOCX file.', 'error');
            }
        };
        fileReader.readAsArrayBuffer(file);
    }

    startAiBtn.addEventListener('click', async () => {
        if (!document.getElementById('aiCategorySelect').value) {
            Swal.fire('Select Category', 'Please select a Target Category before generating.', 'warning');
            return;
        }

        if (!extractedText) {
            Swal.fire('Wait', 'Still parsing the PDF. Try again in a few seconds.', 'warning');
            return;
        }

        // Show Loading
        emptyState.classList.add('d-none');
        resultsList.classList.add('d-none');
        loadingState.classList.remove('d-none');
        loadingState.classList.add('d-flex');
        startAiBtn.disabled = true;
        statusBadge.textContent = 'Analyzing...';
        statusBadge.className = 'badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-2 rounded-pill';

        try {
            const category = document.getElementById('aiCategorySelect').value;
            const response = await fetch('../../backend/api/groq.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: extractedText,
                    category: category
                })
            });

            const result = await response.json();

            if (result.success && result.data && result.data.questions) {
                draftQuestions = result.data.questions;
                renderDraftQuestions();

                statusBadge.textContent = 'Generation Complete';
                statusBadge.className = 'badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill';
                publishAiBtn.classList.remove('d-none');
            } else {
                throw new Error(result.error || 'Failed to generate questions');
            }
        } catch (error) {
            console.error('AI Error:', error);
            Swal.fire('AI Error', 'Failed: ' + error.message, 'error');
            statusBadge.textContent = 'Failed';
            statusBadge.className = 'badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2 rounded-pill';
        } finally {
            loadingState.classList.remove('d-flex');
            loadingState.classList.add('d-none');
            startAiBtn.disabled = false;
        }
    });

    function renderDraftQuestions() {
        resultsList.innerHTML = '';
        resultsList.classList.remove('d-none');

        draftQuestions.forEach((q, index) => {
            const levelBadgeColor = q.level === 4 ? 'danger' : (q.level === 3 ? 'warning' : (q.level === 2 ? 'primary' : 'success'));
            const levelName = q.level === 4 ? 'Boss Battle (Very Hard)' : (q.level === 3 ? 'Hard' : (q.level === 2 ? 'Medium' : 'Easy'));

            let optionsHtml = '';
            if (q.options) {
                q.options.forEach((opt, i) => {
                    const isCorrect = i === q.correctOption;
                    optionsHtml += `<div class="p-2 border rounded mt-1 ${isCorrect ? 'bg-success bg-opacity-10 border-success' : 'bg-light'}"><small>${isCorrect ? '<i class="fa-solid fa-check text-success me-2"></i>' : ''}${opt}</small></div>`;
                });
            }

            resultsList.innerHTML += `
                <div class="p-3 border-bottom position-relative hover-bg-light transition-base" id="draft-q-${index}">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="badge bg-${levelBadgeColor}">Level ${q.level}: ${levelName}</span>
                        <button class="btn btn-sm btn-outline-danger border-0 py-0 px-2" onclick="deleteDraftQuestion(${index})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                    <p class="fw-bold text-dark mb-2">${q.question}</p>
                    ${optionsHtml}
                    <div class="d-flex gap-3 mt-2 text-muted small">
                        <span><i class="fa-solid fa-star text-warning"></i> ${q.xpReward} XP</span>
                        <span><i class="fa-solid fa-coins text-warning"></i> ${q.goldReward} Gold</span>
                    </div>
                </div>
            `;
        });
    }

    // Attach to global window so inline onclick works
    window.deleteDraftQuestion = function (index) {
        draftQuestions.splice(index, 1);
        renderDraftQuestions();
        if (draftQuestions.length === 0) {
            resultsList.classList.add('d-none');
            emptyState.classList.remove('d-none');
            publishAiBtn.classList.add('d-none');
            statusBadge.textContent = 'All drafts deleted';
        }
    };

    publishAiBtn.addEventListener('click', () => {
        if (draftQuestions.length === 0) return;

        const category = document.getElementById('aiCategorySelect').value;
        const categoryName = document.getElementById('aiCategorySelect').options[document.getElementById('aiCategorySelect').selectedIndex].text;

        Swal.fire({
            title: 'Publish to Game?',
            text: `Are you sure you want to add these ${draftQuestions.length} questions to the '${categoryName}' category?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#A594F9',
            confirmButtonText: 'Yes, Publish!'
        }).then((result) => {
            if (result.isConfirmed) {
                publishToFirebase(category);
            }
        });
    });

    async function publishToFirebase(category) {
        try {
            // 1. Show Uploading State
            Swal.fire({
                title: 'Publishing...',
                html: 'Uploading module to cloud storage...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // 2. Upload file to Cloudinary (Optional - Non-blocking)
            let secureUrl = '';
            let moduleId = 'no_module_id';
            const db = firebase.database();
            const file = fileInput.files[0];

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', 'questlearn_modules');

                const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dghen22jr/auto/upload', {
                    method: 'POST',
                    body: formData
                });

                if (cloudinaryResponse.ok) {
                    const cloudinaryData = await cloudinaryResponse.json();
                    secureUrl = cloudinaryData.secure_url;

                    // First, create the new 'modules' entry inside 'quests'
                    const moduleRef = await db.ref('quests/modules').push({
                        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                        fileUrl: secureUrl,
                        category: category,
                        uploadedAt: firebase.database.ServerValue.TIMESTAMP
                    });
                    moduleId = moduleRef.key;
                } else {
                    console.warn("Cloudinary upload failed, but continuing to save questions.");
                }
            } catch (cloudErr) {
                console.warn("Cloudinary error: ", cloudErr);
            }

            Swal.fire({
                title: 'Publishing...',
                html: 'Saving generated questions to database...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            let addedCount = 0;

            // Loop through each drafted question and push it to the correct level node
            for (const q of draftQuestions) {
                // Determine node path based on category
                if (category === 'boss_battle') {
                    // boss_battle schema is extremely different, maybe skip mapping or just push to attacks
                    nodePath = `quests/boss_battle/bosses/0/attacks`;
                } else {
                    nodePath = `quests/${category}/questions`;
                }

                // Map the integer correctOption to 'A', 'B', 'C', 'D'
                const letterMap = ['A', 'B', 'C', 'D'];
                const correctLetter = letterMap[q.correctOption] || 'A';

                // Format the options as a string with line breaks
                const optionsString = q.options && Array.isArray(q.options) ? `A. ${q.options[0] || ''}\nB. ${q.options[1] || ''}\nC. ${q.options[2] || ''}\nD. ${q.options[3] || ''}` : 'No options provided';

                // Force level to be an integer between 1 and 4
                let safeLevel = parseInt(q.level);
                if (isNaN(safeLevel) || safeLevel < 1 || safeLevel > 4) {
                    safeLevel = 1;
                }

                // Map to specific schema based on category
                let mappedData = {
                    id: Date.now() + '-' + Math.random().toString(36).substr(2, 5),
                    level: safeLevel,
                    hpPenalty: q.goldReward || 5, // Approximate mapping
                    hpReward: q.xpReward || 10,
                    sourceModuleId: moduleId
                };

                if (category === 'grammar') {
                    mappedData.incorrectSentence = q.question;
                    mappedData.explanation = optionsString;
                    mappedData.correctSentence = correctLetter;
                } else if (category === 'reading') {
                    mappedData.question = q.question;
                    mappedData.storyPassage = optionsString;
                    mappedData.correctAnswer = correctLetter;
                    mappedData.storyTitle = "AI Generated from: " + file.name;
                } else if (category === 'vocabulary') {
                    mappedData.word = q.question;
                    mappedData.question = optionsString;
                    mappedData.correctAnswer = correctLetter;
                } else if (category === 'information_literacy') {
                    mappedData.incorrectSentence = q.question; // Same as grammar
                    mappedData.explanation = optionsString;
                    mappedData.correctSentence = correctLetter;
                } else {
                    // Fallback for others
                    mappedData.question = q.question;
                    mappedData.options = optionsString;
                    mappedData.correctAnswer = correctLetter;
                }

                // Fetch current node to determine next integer index
                const snapshot = await db.ref(nodePath).once('value');
                const data = snapshot.val();
                let nextIndex = 0;
                if (Array.isArray(data)) {
                    nextIndex = data.length;
                } else if (data) {
                    // It's an object, find the max integer key
                    const keys = Object.keys(data);
                    let maxInt = -1;
                    keys.forEach(k => {
                        const parsed = parseInt(k);
                        if (!isNaN(parsed) && parsed > maxInt) maxInt = parsed;
                    });
                    nextIndex = maxInt + 1;
                }

                await db.ref(`${nodePath}/${nextIndex}`).set(mappedData);

                addedCount++;
            }

            Swal.fire('Published!', `Successfully added the module and ${addedCount} questions to the database.`, 'success').then(() => {
                // Close modal and refresh UI
                const modal = bootstrap.Modal.getInstance(document.getElementById('aiGeneratorModal'));
                modal.hide();
                // trigger loadQuestions from quests.js
                if (typeof loadQuestions === 'function') loadQuestions();
            });

        } catch (error) {
            console.error('Publish Error:', error);
            Swal.fire('Error', 'Failed to publish: ' + error.message, 'error');
        }
    }
});
