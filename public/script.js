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
});
