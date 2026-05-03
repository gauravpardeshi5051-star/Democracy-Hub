document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation ---
    const navLinks = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.view-section');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const targetId = link.getAttribute('data-target');
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active');
                    section.classList.remove('hidden');
                } else {
                    section.classList.remove('active');
                    section.classList.add('hidden');
                }
            });
        });
    });

    // --- Data ---
    const timelineData = [
        { date: 'Phase 1', title: 'Announcement & MCC', desc: 'Election Commission announces schedule. Model Code of Conduct comes into effect.' },
        { date: 'Phase 2', title: 'Nominations', desc: 'Candidates file their nomination papers. Scrutiny and withdrawal period follows.' },
        { date: 'Phase 3', title: 'Campaigning', desc: 'Parties release manifestos, hold rallies. Ends 48 hours before polling.' },
        { date: 'Phase 4', title: 'Polling Days', desc: 'Voting takes place in multiple phases across different states using EVMs.' },
        { date: 'Phase 5', title: 'Counting & Results', desc: 'EVMs are opened, votes are counted under strict security, and results are declared.' }
    ];

    const stepsData = [
        { icon: 'fa-search', title: 'Check Electoral Roll', desc: 'Verify your name is on the voter list online at the NVSP portal or via SMS.' },
        { icon: 'fa-id-card', title: 'Carry Valid ID', desc: 'Bring your Voter ID (EPIC) or any other ECI-approved photo ID to the polling booth.' },
        { icon: 'fa-map-marker-alt', title: 'Locate Polling Booth', desc: 'Find your designated polling station. Mobile phones are usually not allowed inside.' },
        { icon: 'fa-fingerprint', title: 'Identity Verification', desc: 'Polling officers check your ID, mark your finger with indelible ink, and give you a slip.' },
        { icon: 'fa-box-open', title: 'Use EVM & VVPAT', desc: 'Press the blue button against your chosen candidate. Check the VVPAT slip for 7 seconds to verify.' }
    ];

    const flashcardsData = [
        { q: 'What is the ECI?', a: 'The Election Commission of India, an autonomous constitutional body responsible for administering elections.' },
        { q: 'What is an EVM?', a: 'Electronic Voting Machine. Used in Indian elections to record votes securely and efficiently.' },
        { q: 'What does VVPAT stand for?', a: 'Voter Verifiable Paper Audit Trail. A slip generated to let voters verify their vote was cast correctly.' },
        { q: 'What is the Model Code of Conduct (MCC)?', a: 'A set of guidelines issued by the ECI to regulate political parties and candidates prior to elections.' },
        { q: 'What is NOTA?', a: '"None Of The Above". An option on the EVM to register a vote of rejection for all candidates.' }
    ];

    const quizData = [
        {
            q: "Who conducts the elections to the Lok Sabha in India?",
            options: ["President of India", "Supreme Court", "Election Commission of India", "Parliament"],
            ans: 2
        },
        {
            q: "What is the minimum voting age in India?",
            options: ["16 Years", "18 Years", "21 Years", "25 Years"],
            ans: 1
        },
        {
            q: "Which machine is used to cast votes electronically in India?",
            options: ["ATM", "EVM", "POS", "VVPAT"],
            ans: 1
        },
        {
            q: "What does the indelible ink applied to a voter's finger signify?",
            options: ["Voter's party preference", "Proof of citizenship", "That the person has cast their vote", "Age verification"],
            ans: 2
        },
        {
            q: "If you don't want to vote for any candidate, which button do you press?",
            options: ["CANCEL", "REJECT", "NOTA", "EXIT"],
            ans: 2
        }
    ];

    // --- Populate Timeline ---
    const timelineContainer = document.querySelector('.timeline-container');
    timelineData.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `timeline-item ${index % 2 === 0 ? 'left' : 'right'}`;
        div.innerHTML = `
            <div class="timeline-content">
                <span class="timeline-date">${item.date}</span>
                <h3>${item.title}</h3>
                <p>${item.desc}</p>
            </div>
        `;
        timelineContainer.appendChild(div);
    });

    // --- Populate Steps ---
    const stepsContainer = document.querySelector('.steps-container');
    stepsData.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'step-card';
        div.innerHTML = `
            <div class="step-number">0${index + 1}</div>
            <div class="icon-wrapper" style="font-size: 2rem; color: var(--primary); min-width: 50px; text-align: center;">
                <i class="fas ${item.icon}"></i>
            </div>
            <div class="step-details">
                <h3>${item.title}</h3>
                <p>${item.desc}</p>
            </div>
        `;
        stepsContainer.appendChild(div);
    });

    // --- Flashcards Logic ---
    let currentCardIndex = 0;
    const flashcard = document.getElementById('flashcard');
    const frontContent = document.getElementById('card-front-content');
    const backContent = document.getElementById('card-back-content');
    const prevBtn = document.getElementById('prev-card');
    const nextBtn = document.getElementById('next-card');
    const counter = document.getElementById('card-counter');

    function updateCard() {
        flashcard.style.transition = 'none';
        flashcard.classList.remove('flipped');
        
        setTimeout(() => {
            frontContent.textContent = flashcardsData[currentCardIndex].q;
            backContent.textContent = flashcardsData[currentCardIndex].a;
            counter.textContent = `${currentCardIndex + 1} / ${flashcardsData.length}`;
            flashcard.style.transition = '';
        }, 50);
    }

    flashcard.addEventListener('click', () => flashcard.classList.toggle('flipped'));
    
    prevBtn.addEventListener('click', () => {
        if (currentCardIndex > 0) { currentCardIndex--; updateCard(); }
    });

    nextBtn.addEventListener('click', () => {
        if (currentCardIndex < flashcardsData.length - 1) { currentCardIndex++; updateCard(); }
    });

    updateCard();

    // --- Quiz Logic ---
    let currentQuizQ = 0;
    let score = 0;

    const quizStartPanel = document.getElementById('quiz-start');
    const quizActivePanel = document.getElementById('quiz-active');
    const quizResultPanel = document.getElementById('quiz-result');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');
    
    const quizQuestionText = document.getElementById('quiz-question');
    const quizOptionsContainer = document.getElementById('quiz-options');
    const quizProgressBar = document.getElementById('quiz-progress-bar');
    const quizQCounter = document.getElementById('quiz-question-counter');
    const finalScoreEl = document.getElementById('quiz-score');
    const feedbackTitle = document.getElementById('quiz-feedback-title');
    const feedbackText = document.getElementById('quiz-feedback-text');

    function loadQuizQuestion() {
        const qData = quizData[currentQuizQ];
        quizQuestionText.textContent = qData.q;
        quizQCounter.textContent = `Question ${currentQuizQ + 1} of ${quizData.length}`;
        quizProgressBar.style.setProperty('--progress', `${((currentQuizQ) / quizData.length) * 100}%`);
        
        quizOptionsContainer.innerHTML = '';
        qData.options.forEach((opt, idx) => {
            const btn = document.createElement('div');
            btn.className = 'quiz-option';
            btn.innerHTML = `<i class="far fa-circle"></i> ${opt}`;
            btn.addEventListener('click', () => selectOption(idx, btn));
            quizOptionsContainer.appendChild(btn);
        });
    }

    function selectOption(selectedIdx, btnElement) {
        // Disable further clicks
        const allOptions = quizOptionsContainer.querySelectorAll('.quiz-option');
        allOptions.forEach(opt => opt.style.pointerEvents = 'none');

        const correctIdx = quizData[currentQuizQ].ans;

        if (selectedIdx === correctIdx) {
            btnElement.classList.add('correct');
            btnElement.innerHTML = `<i class="fas fa-check-circle"></i> ${quizData[currentQuizQ].options[selectedIdx]}`;
            score++;
        } else {
            btnElement.classList.add('wrong');
            btnElement.innerHTML = `<i class="fas fa-times-circle"></i> ${quizData[currentQuizQ].options[selectedIdx]}`;
            
            // Highlight correct one
            allOptions[correctIdx].classList.add('correct');
            allOptions[correctIdx].innerHTML = `<i class="fas fa-check-circle"></i> ${quizData[currentQuizQ].options[correctIdx]}`;
        }

        setTimeout(() => {
            currentQuizQ++;
            if (currentQuizQ < quizData.length) {
                loadQuizQuestion();
            } else {
                showResults();
            }
        }, 1500);
    }

    function showResults() {
        quizActivePanel.classList.add('hidden');
        quizActivePanel.classList.remove('active');
        quizResultPanel.classList.remove('hidden');
        quizResultPanel.classList.add('active');

        finalScoreEl.textContent = score;
        
        // Update circular progress visual
        const deg = (score / quizData.length) * 360;
        document.querySelector('.score-circle').style.setProperty('--score-deg', `${deg}deg`);

        if (score === 5) {
            feedbackTitle.textContent = "Outstanding!";
            feedbackText.textContent = "You are an incredibly well-informed voter!";
        } else if (score >= 3) {
            feedbackTitle.textContent = "Great Job!";
            feedbackText.textContent = "You have a solid understanding of the system.";
        } else {
            feedbackTitle.textContent = "Good Try!";
            feedbackText.textContent = "Review the Flashcards and Steps to learn more.";
        }
    }

    startQuizBtn.addEventListener('click', () => {
        quizStartPanel.classList.add('hidden');
        quizStartPanel.classList.remove('active');
        quizActivePanel.classList.remove('hidden');
        quizActivePanel.classList.add('active');
        currentQuizQ = 0;
        score = 0;
        loadQuizQuestion();
    });

    restartQuizBtn.addEventListener('click', () => {
        quizResultPanel.classList.add('hidden');
        quizResultPanel.classList.remove('active');
        quizStartPanel.classList.remove('hidden');
        quizStartPanel.classList.add('active');
    });


    // --- AI Assistant Logic ---
    const assistantToggle = document.getElementById('assistant-toggle');
    const chatWindow = document.getElementById('chat-window');
    const closeChatBtn = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-msg');
    const chatMessages = document.getElementById('chat-messages');

    assistantToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden')) {
            chatInput.focus();
        }
    });

    closeChatBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
    });

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function handleSendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        chatInput.value = '';

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await response.json();
            addMessage(data.reply, 'bot');
        } catch (error) {
            console.error("Error:", error);
            addMessage("Network error. Please try again.", 'bot');
        }
    }

    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });
});
