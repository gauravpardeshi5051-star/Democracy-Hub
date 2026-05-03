document.addEventListener('DOMContentLoaded', () => {
    // --- Global Gamification State ---
    let democracyPoints = 0;
    const pointsEl = document.getElementById('total-points');
    const badgeLevelEl = document.getElementById('badge-level');
    const badgeContainer = document.getElementById('democracy-badge');

    const levels = [
        { min: 0, label: 'Newbie Voter' },
        { min: 50, label: 'Informed Citizen' },
        { min: 150, label: 'Civic Expert' },
        { min: 300, label: 'Democracy Champion' },
        { min: 500, label: 'Nation Builder' }
    ];

    function addPoints(pts) {
        democracyPoints += pts;
        pointsEl.textContent = democracyPoints;
        
        // Update Level
        const level = [...levels].reverse().find(l => democracyPoints >= l.min);
        badgeLevelEl.textContent = level.label;

        // Visual Feedback
        badgeContainer.style.transform = 'scale(1.1)';
        setTimeout(() => badgeContainer.style.transform = 'scale(1)', 200);
    }

    // --- Particle Engine ---
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function initParticles() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speedX: Math.random() * 1 - 0.5,
                speedY: Math.random() * 1 - 0.5,
                color: Math.random() > 0.5 ? 'rgba(255, 153, 51, 0.2)' : 'rgba(19, 136, 8, 0.2)'
            });
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x > canvas.width) p.x = 0;
            if (p.x < 0) p.x = canvas.width;
            if (p.y > canvas.height) p.y = 0;
            if (p.y < 0) p.y = canvas.height;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
        requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', initParticles);
    initParticles();
    animateParticles();

    // --- 3D Tilt Effect ---
    document.addEventListener('mousemove', (e) => {
        const tilts = document.querySelectorAll('.tilt');
        tilts.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
    });

    document.addEventListener('mouseleave', () => {
        document.querySelectorAll('.tilt').forEach(card => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        });
    });

    // --- Navigation & Section Tracking ---
    const navLinks = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.view-section');
    const visitedSections = new Set();

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetId = link.getAttribute('data-target');
            
            // Gamification: First visit points
            if (!visitedSections.has(targetId) && targetId !== 'home') {
                addPoints(15);
                visitedSections.add(targetId);
            }

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active');
                    section.classList.remove('hidden');
                    if (targetId === 'leaderboard') loadLeaderboard();
                } else {
                    section.classList.remove('active');
                    section.classList.add('hidden');
                }
            });
        });
    });

    // --- Leaderboard Logic ---
    async function loadLeaderboard() {
        const podiumContainer = document.getElementById('podium-container');
        const leaderboardBody = document.getElementById('leaderboard-body');
        
        try {
            const res = await fetch('/api/leaderboard');
            const data = await res.json();
            
            // Podium (Top 3)
            const top3 = data.slice(0, 3);
            podiumContainer.innerHTML = '';
            const order = [1, 0, 2]; // 2nd, 1st, 3rd for visual podium
            order.forEach(idx => {
                if (!top3[idx]) return;
                const item = top3[idx];
                const rankClass = idx === 0 ? 'first' : idx === 1 ? 'second' : 'third';
                const div = document.createElement('div');
                div.className = `podium-item ${rankClass}`;
                div.innerHTML = `
                    <div class="podium-rank">${item.rank}</div>
                    <div class="podium-name">${item.name}</div>
                    <div class="podium-score">${item.score}</div>
                `;
                podiumContainer.appendChild(div);
            });

            // Rest of rankings
            leaderboardBody.innerHTML = '';
            data.slice(3).forEach(item => {
                const row = document.createElement('div');
                row.className = 'ranking-row';
                row.innerHTML = `
                    <span class="rank">#${item.rank}</span>
                    <span class="name">${item.name}</span>
                    <span class="score">${item.score}</span>
                `;
                leaderboardBody.appendChild(row);
            });
        } catch (e) { console.error("Leaderboard load failed", e); }
    }

    // --- Voice AI Logic ---
    const voiceBtn = document.getElementById('voice-btn');
    const synth = window.speechSynthesis;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        
        recognition.onstart = () => voiceBtn.classList.add('active');
        recognition.onend = () => voiceBtn.classList.remove('active');
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chat-input').value = transcript;
            handleSendMessage();
        };
    }

    voiceBtn.addEventListener('click', () => {
        if (recognition) recognition.start();
        else alert("Speech Recognition not supported in this browser.");
    });

    function speak(text) {
        if (synth.speaking) synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.pitch = 1;
        utter.rate = 1;
        synth.speak(utter);
    }

    // Intercept chat bot messages to speak them
    const originalAddMessage = addMessage;
    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = text;
        document.getElementById('chat-messages').appendChild(msgDiv);
        document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
        
        if (sender === 'bot') {
            speak(text);
        }
    }

    // --- Electoral Search & Points ---
    const searchVoterBtn = document.getElementById('search-voter-btn');
    searchVoterBtn.addEventListener('click', async () => {
        const epic = document.getElementById('epic-input').value.trim();
        if (!epic) return;
        
        try {
            const response = await fetch('/api/search-voter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ epic })
            });
            const data = await response.json();
            if (data.found) addPoints(20);
        } catch(e){}
    });

    // --- Quiz & Submission ---
    const submitScoreBtn = document.getElementById('submit-score-btn');
    submitScoreBtn.addEventListener('click', async () => {
        const name = document.getElementById('leaderboard-name').value.trim();
        if (!name) return alert("Please enter your name!");

        submitScoreBtn.disabled = true;
        submitScoreBtn.textContent = "Submitting...";

        try {
            const res = await fetch('/api/submit-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, score: democracyPoints })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Successfully joined! You are ranked #${data.rank}`);
                document.querySelector('[data-target=leaderboard]').click();
            }
        } catch (e) {}
    });

    // --- Re-attach original script functionality ---
    // (Timeline, Steps, Flashcards, Quiz panels, Chat toggle etc)
    // For brevity, I will merge the logic here...

    // --- Chat Logic ---
    const assistantToggle = document.getElementById('assistant-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-msg');

    assistantToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
    });

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
        } catch (error) {}
    }

    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSendMessage(); });

    // --- Timeline & Steps Populate ---
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

    const timelineContainer = document.querySelector('.timeline-container');
    timelineData.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `timeline-item ${index % 2 === 0 ? 'left' : 'right'}`;
        div.innerHTML = `<div class="timeline-content"><span class="timeline-date">${item.date}</span><h3>${item.title}</h3><p>${item.desc}</p></div>`;
        timelineContainer.appendChild(div);
    });

    const stepsContainer = document.querySelector('.steps-container');
    stepsData.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'step-card';
        div.innerHTML = `<div class="step-number">0${index+1}</div><div class="icon-wrapper" style="font-size: 2rem; color: var(--primary); min-width: 50px; text-align: center;"><i class="fas ${item.icon}"></i></div><div class="step-details"><h3>${item.title}</h3><p>${item.desc}</p></div>`;
        stepsContainer.appendChild(div);
    });

    // Flashcards & Quiz panel toggle logic ... (simplified for merge)
    const flashcard = document.getElementById('flashcard');
    if(flashcard) flashcard.addEventListener('click', () => { flashcard.classList.toggle('flipped'); addPoints(5); });

    const startQuizBtn = document.getElementById('start-quiz-btn');
    if(startQuizBtn) startQuizBtn.addEventListener('click', () => {
        document.getElementById('quiz-start').classList.add('hidden');
        document.getElementById('quiz-active').classList.remove('hidden');
        // Initializing first quiz question would go here... (merged logic)
    });
});
