<?php $base = '../../'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Curriculum Quests - QuestLearn</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="icon" type="image/png" href="<?php echo $base; ?>assets/images/logo.png">
    <link rel="stylesheet" href="<?php echo $base; ?>assets/css/style.css?v=<?php echo time(); ?>">
</head>
<body>
    <div class="d-flex">
        <?php include $base . 'includes/components/sidebar.php'; ?>
        <div id="content">
            <?php include $base . 'includes/components/navbar.php'; ?>
            <div class="container-fluid p-4 p-md-5">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                    <div>
                        <h2 class="mb-1">Game Content Manager</h2>
                        <p class="text-muted mb-0"><i class="fa-solid fa-gamepad text-primary me-2"></i> Manage questions and RPG rewards</p>
                    </div>
                    <div class="d-flex gap-3 align-items-center flex-wrap">
                        <select class="form-select shadow-sm" id="categorySelect" style="width: 220px;">
                            <option value="grammar">Grammar</option>
                            <option value="vocabulary">Vocabulary</option>
                            <option value="reading">Reading Comprehension</option>
                            <option value="spelling">Spelling</option>
                            <option value="information_literacy">Information Literacy</option>
                            <option value="boss_battle">Boss Battle</option>
                            <option value="challenge">Challenge</option>
                            <option value="daily">Daily Quests</option>
                            <option value="puzzle">Puzzle</option>
                            <option value="review">Review</option>
                            <option value="story">Story</option>
                            <option value="timed">Timed Stages</option>
                        </select>
                        <select class="form-select shadow-sm" id="levelSelect" style="width: 150px;">
                            <option value="1">Level 1</option>
                            <option value="2">Level 2</option>
                            <option value="3">Level 3</option>
                            <option value="4">Level 4</option>
                        </select>
                        <button class="btn btn-danger px-3 py-2 d-flex align-items-center gap-2 d-none" id="deleteSelectedBtn">
                            <i class="fa-solid fa-trash-can"></i> Delete Selected (<span id="selectedCount">0</span>)
                        </button>
                        <div class="form-check d-flex align-items-center me-2 mb-0">
                            <input class="form-check-input m-0 shadow-sm border-secondary" type="checkbox" id="selectAllCheckbox" style="width: 22px; height: 22px; cursor: pointer;">
                            <label class="form-check-label ms-2 fw-bold text-muted" for="selectAllCheckbox" style="cursor: pointer; padding-top: 2px;">Select All</label>
                        </div>
                        <button class="btn btn-outline-primary px-3 py-2 d-flex align-items-center gap-2 bg-white" data-bs-toggle="modal" data-bs-target="#aiGeneratorModal">
                            <i class="fa-solid fa-wand-magic-sparkles text-warning"></i> Generate with AI
                        </button>
                        <button class="btn btn-primary px-4 py-2 d-flex align-items-center gap-2" id="addQuestBtn">
                            <i class="fa-solid fa-plus"></i> Add Question
                        </button>
                    </div>
                </div>
                
                <!-- This container is dynamically injected with Firebase data -->
                <div class="row g-4" id="questsContainer">
                </div>
            </div>
        </div>
    </div>
    
    <!-- AI Generator Modal -->
    <div class="modal fade" id="aiGeneratorModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div class="modal-header bg-light border-bottom-0 p-4 pb-3">
                    <h5 class="modal-title fw-bold d-flex align-items-center gap-3">
                        <div class="bg-primary bg-opacity-10 text-primary rounded-3 p-2 d-flex align-items-center justify-content-center">
                            <i class="fa-solid fa-wand-magic-sparkles"></i>
                        </div>
                        AI Curriculum Generator
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4 pt-2">
                    <p class="text-muted mb-4">Upload a PDF module and the AI will instantly read the text, analyze it, and generate RPG-ready questions across 4 difficulty levels.</p>
                    
                    <div class="row g-4">
                        <!-- Upload Section -->
                        <div class="col-lg-4 border-end pe-lg-4">
                            
                            <!-- AI Mode Selection -->
                            <div class="mb-3 text-start">
                                <label class="form-label small fw-bold text-muted mb-1">AI Action Mode</label>
                                <select class="form-select shadow-sm bg-white" id="aiModeSelect">
                                    <option value="generate">Generate from Module (Create New)</option>
                                    <option value="parse">Parse Existing Questions (Analyze & Level)</option>
                                </select>
                            </div>

                            <!-- Category Selection -->
                            <div class="mb-4 text-start">
                                <label class="form-label small fw-bold text-muted mb-1">Target Category</label>
                                <select class="form-select shadow-sm bg-white" id="aiCategorySelect">
                                    <option value="" disabled selected>Select a Target Category...</option>
                                    <option value="grammar">Grammar</option>
                                    <option value="vocabulary">Vocabulary</option>
                                    <option value="reading">Reading Comprehension</option>
                                    <option value="spelling">Spelling</option>
                                    <option value="information_literacy">Information Literacy</option>
                                    <option value="boss_battle">Boss Battle</option>
                                    <option value="challenge">Challenge</option>
                                    <option value="daily">Daily Quests</option>
                                    <option value="puzzle">Puzzle</option>
                                    <option value="review">Review</option>
                                    <option value="story">Story</option>
                                    <option value="timed">Timed Stages</option>
                                </select>
                            </div>

                            <div class="upload-zone border border-2 border-dashed rounded-4 p-4 text-center bg-light transition-base hover-bg-white" id="pdfUploadZone" style="cursor: pointer;">
                                <i class="fa-solid fa-file-pdf fa-3x text-danger mb-3 opacity-75"></i>
                                <h6 class="fw-bold mb-1 text-dark">Click or drag PDF or DOCX here</h6>
                                <p class="small text-muted mb-0">Any file size accepted</p>
                                <input type="file" id="moduleFileInput" class="d-none" accept=".pdf,.docx">
                            </div>
                            
                            <div class="mt-4" id="aiControls" style="display: none;">
                                <div class="d-flex align-items-center gap-3 p-3 bg-white border rounded-3 mb-3 shadow-sm">
                                    <i class="fa-solid fa-file-pdf text-danger fs-4"></i>
                                    <div class="overflow-hidden">
                                        <div class="fw-bold text-truncate" id="selectedFileName" style="font-size: 0.95rem;">document.pdf</div>
                                        <div class="small text-success fw-medium"><i class="fa-solid fa-check me-1"></i> Ready for analysis</div>
                                    </div>
                                </div>

                                <button class="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2" id="startAiBtn">
                                    <i class="fa-solid fa-microchip"></i> Start AI Generation
                                </button>
                            </div>
                        </div>

                        <!-- Preview Section -->
                        <div class="col-lg-8 ps-lg-4">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="fw-bold mb-0 text-dark">Draft Questions (Review)</h6>
                                <span class="badge bg-secondary bg-opacity-10 text-secondary border px-3 py-2 rounded-pill" id="aiStatusBadge">Waiting for document...</span>
                            </div>

                            <div class="bg-white border rounded-4 overflow-hidden shadow-sm d-flex flex-column" style="height: 400px;">
                                <!-- Loading State -->
                                <div id="aiLoadingState" class="h-100 w-100 d-none flex-column align-items-center justify-content-center bg-light">
                                    <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;"></div>
                                    <h6 class="fw-bold text-dark">Analyzing Document...</h6>
                                    <p class="small text-muted mb-0 text-center px-4">Groq LPU is processing the text and structuring the RPG JSON schema. This usually takes 2-5 seconds.</p>
                                </div>

                                <!-- Empty State -->
                                <div id="aiEmptyState" class="h-100 w-100 d-flex flex-column align-items-center justify-content-center text-muted">
                                    <i class="fa-solid fa-list-check fa-3x mb-3 opacity-25"></i>
                                    <p class="mb-0 fw-medium">No questions generated yet.</p>
                                </div>

                                <!-- Results List -->
                                <div id="aiResultsList" class="h-100 overflow-auto p-0 d-none">
                                    <!-- Dynamic content goes here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-top-0 p-4 bg-light d-flex justify-content-between align-items-center">
                    <div class="text-muted small"><i class="fa-solid fa-bolt text-warning me-1"></i> Powered by Groq AI</div>
                    <div>
                        <button type="button" class="btn btn-light px-4" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success px-4 d-none fw-bold" id="publishAiBtn">
                            <i class="fa-solid fa-cloud-arrow-up me-2"></i> Publish to Game
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    <!-- PDF.js for client-side text extraction -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
    <!-- Mammoth.js for DOCX extraction -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"></script>
    <script src="<?php echo $base; ?>assets/js/main.js?v=<?php echo time(); ?>"></script>
    
    <!-- Firebase SDK Setup -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
    
    <!-- Config and Real-time Fetch Logic -->
    <script src="<?php echo $base; ?>backend/config/firebase.js"></script>
    <script src="<?php echo $base; ?>assets/js/quests.js?v=<?php echo time(); ?>"></script>
    <script src="<?php echo $base; ?>assets/js/ai_generator.js?v=<?php echo time(); ?>"></script>
</body>
</html>
