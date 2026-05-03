document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let democracyPoints = 0;
    const earnedStamps = new Set();
    const visitedSections = new Set();

    const pointsEl = document.getElementById('total-points');
    const badgeLevelEl = document.getElementById('badge-level');
    const passportScoreEl = document.getElementById('passport-score');
    const passportLevelEl = document.getElementById('passport-level');

    const levels = [
        { min: 0, label: 'Newbie Voter' },
        { min: 100, label: 'Informed Citizen' },
        { min: 250, label: 'Civic Expert' },
        { min: 500, label: 'Democracy Champion' }
    ];

    function addPoints(pts, source) {
        democracyPoints += pts;
        pointsEl.textContent = democracyPoints;
        passportScoreEl.textContent = democracyPoints;
        
        const level = [...levels].reverse().find(l => democracyPoints >= l.min);
        badgeLevelEl.textContent = level.label;
        passportLevelEl.textContent = level.label;

        if (source) earnStamp(source);
    }

    function earnStamp(id) {
        const slot = document.querySelector(`.stamp-slot[data-stamp="${id}"]`);
        if (slot && !earnedStamps.has(id)) {
            earnedStamps.add(id);
            slot.classList.add('earned');
            slot.innerHTML = '<i class="fas fa-certificate"></i>';
            // Play a subtle sound effect here if desired
        }
    }

    // --- Particle Canvas ---
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    function initParticles() {
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1, speedX: Math.random() * 1 - 0.5, speedY: Math.random() * 1 - 0.5,
                color: Math.random() > 0.5 ? 'rgba(255, 153, 51, 0.15)' : 'rgba(19, 136, 8, 0.15)'
            });
        }
    }
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.speedX; p.y += p.speedY;
            if (p.x > canvas.width || p.x < 0) p.speedX *= -1;
            if (p.y > canvas.height || p.y < 0) p.speedY *= -1;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color; ctx.fill();
        });
        requestAnimationFrame(animateParticles);
    }
    initParticles(); animateParticles();

    // --- Navigation ---
    const navLinks = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.view-section');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetId = link.getAttribute('data-target');
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            sections.forEach(s => {
                s.classList.toggle('active', s.id === targetId);
                s.classList.toggle('hidden', s.id !== targetId);
            });
            if (targetId === 'pulse') loadPulseMap();
            if (!visitedSections.has(targetId) && targetId !== 'home') {
                visitedSections.add(targetId);
                addPoints(10);
            }
        });
    });

    // --- Democracy Pulse Map Interaction ---
    async function loadPulseMap() {
        const statsOverlay = document.getElementById('map-stats');
        try {
            const res = await fetch('/api/pulse-data');
            const data = await res.json();
            
            document.querySelectorAll('.state-path').forEach(path => {
                const stateId = path.id;
                const stateData = data.find(s => s.id === stateId);
                
                path.addEventListener('mouseenter', () => {
                    if (stateData) {
                        statsOverlay.innerHTML = `
                            <h3>${stateData.name}</h3>
                            <p><strong>Engagement:</strong> <span style="color:var(--secondary)">${stateData.engagement}</span></p>
                            <p><strong>Trending:</strong> ${stateData.topSearch}</p>
                            <p><strong>Active Pulse:</strong> ${stateData.users.toLocaleString()}</p>
                        `;
                    }
                });
            });
        } catch(e) { console.error("Pulse fetch error", e); }
    }

    // --- Electoral Search Achievement ---
    const searchBtn = document.getElementById('search-voter-btn');
    searchBtn.addEventListener('click', async () => {
        const epic = document.getElementById('epic-input').value.trim();
        if (!epic) return;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        try {
            const res = await fetch('/api/search-voter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ epic })
            });
            const data = await res.json();
            document.getElementById('search-results').classList.remove('hidden');
            document.getElementById('search-results').innerHTML = `<p>Found: ${data.details.name} at ${data.details.station}</p>`;
            addPoints(30, 'search');
        } catch(e) {} finally { searchBtn.innerHTML = 'Search'; }
    });

    // --- Quiz Achievement ---
    const startQuizBtn = document.getElementById('start-quiz-btn');
    startQuizBtn.addEventListener('click', () => {
        document.getElementById('quiz-start').classList.add('hidden');
        document.getElementById('quiz-active').classList.remove('hidden');
        // Simple mock quiz flow for demo
        setTimeout(() => {
            document.getElementById('quiz-active').classList.add('hidden');
            document.getElementById('quiz-result').classList.remove('hidden');
            document.getElementById('quiz-score').textContent = "5";
            addPoints(50, 'quiz');
        }, 3000);
    });

    // --- Voice AI Logic ---
    const voiceBtn = document.getElementById('voice-btn');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const synth = window.speechSynthesis;

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.onstart = () => voiceBtn.classList.add('active');
        recognition.onend = () => voiceBtn.classList.remove('active');
        recognition.onresult = (e) => { chatInput.value = e.results[0][0].transcript; handleSend(); };
        voiceBtn.addEventListener('click', () => recognition.start());
    }

    function addMsg(text, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.textContent = text;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        if (sender === 'bot') {
            const utter = new SpeechSynthesisUtterance(text);
            synth.speak(utter);
        }
    }

    async function handleSend() {
        const text = chatInput.value.trim(); if (!text) return;
        addMsg(text, 'user'); chatInput.value = '';
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        addMsg(data.reply, 'bot');
    }

    document.getElementById('send-msg').addEventListener('click', handleSend);

    // Initial Stamp Check for Flashcards
    document.getElementById('flashcard').addEventListener('click', () => {
        document.getElementById('flashcard').classList.toggle('flipped');
        addPoints(5, 'knowledge');
    });

    // 3D Tilt for Hero Cards
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.tilt').forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(1000px) rotateY(${x * 20}deg) rotateX(${y * -20}deg)`;
        });
    });
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

    const flashcardsData = [
        { front: 'What is ECI?', back: 'The Election Commission of India (ECI) is an autonomous constitutional authority responsible for administering election processes in India.' },
        { front: 'What is an EVM?', back: 'Electronic Voting Machine (EVM) is used for casting and counting votes. It consists of a Control Unit and a Balloting Unit.' },
        { front: 'What is VVPAT?', back: 'Voter Verifiable Paper Audit Trail (VVPAT) allows voters to verify that their vote was cast correctly via a paper slip.' },
        { front: 'What is NOTA?', back: 'None of the Above (NOTA) allows voters to officially register a vote of rejection for all candidates.' },
        { front: 'What is MCC?', back: 'Model Code of Conduct (MCC) is a set of guidelines issued by ECI for political parties and candidates during elections.' }
    ];

    const timelineContainer = document.querySelector('.timeline-container');
    if (timelineContainer) {
        timelineData.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = `timeline-item ${index % 2 === 0 ? 'left' : 'right'}`;
            div.innerHTML = `<div class="timeline-content"><span class="timeline-date">${item.date}</span><h3>${item.title}</h3><p>${item.desc}</p></div>`;
            timelineContainer.appendChild(div);
        });
    }

    const stepsContainer = document.querySelector('.steps-container');
    if (stepsContainer) {
        stepsData.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'step-card';
            div.innerHTML = `<div class="step-number">0${index+1}</div><div class="icon-wrapper" style="font-size: 2rem; color: var(--primary); min-width: 50px; text-align: center;"><i class="fas ${item.icon}"></i></div><div class="step-details"><h3>${item.title}</h3><p>${item.desc}</p></div>`;
            stepsContainer.appendChild(div);
        });
    }

    // Flashcard Logic
    let currentCardIndex = 0;
    function updateFlashcard() {
        const front = document.getElementById('card-front-content');
        const back = document.getElementById('card-back-content');
        if (front && back) {
            front.textContent = flashcardsData[currentCardIndex].front;
            back.textContent = flashcardsData[currentCardIndex].back;
            document.getElementById('flashcard').classList.remove('flipped');
        }
    }
    updateFlashcard();

    document.getElementById('prev-card')?.addEventListener('click', (e) => {
        e.stopPropagation();
        currentCardIndex = (currentCardIndex - 1 + flashcardsData.length) % flashcardsData.length;
        updateFlashcard();
    });
    document.getElementById('next-card')?.addEventListener('click', (e) => {
        e.stopPropagation();
        currentCardIndex = (currentCardIndex + 1) % flashcardsData.length;
        updateFlashcard();
    });
});
