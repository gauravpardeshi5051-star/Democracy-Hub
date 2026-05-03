const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// Mock database for Electoral Search
const mockVoterDatabase = {
    'ABC1234567': { name: 'Rahul Sharma', age: 29, gender: 'Male', ac: 'New Delhi', part: '45', station: 'Govt Boys Sr Sec School, Room 2' },
    'XYZ9876543': { name: 'Priya Patel', age: 34, gender: 'Female', ac: 'Ahmedabad West', part: '12', station: 'Saraswati Vidya Mandir' },
    'DEF1112223': { name: 'Amit Singh', age: 45, gender: 'Male', ac: 'Lucknow Central', part: '89', station: 'City Montessori School' }
};

// 🔍 Endpoint: Electoral Search
app.post('/api/search-voter', (req, res) => {
    const { epic } = req.body;
    // Simulate database delay
    setTimeout(() => {
        const voter = mockVoterDatabase[epic.toUpperCase()];
        if (voter) {
            res.json({ found: true, details: voter });
        } else {
            // Generate a random mock response if it looks like a valid EPIC format (3 letters + 7 numbers)
            const epicRegex = /^[A-Z]{3}[0-9]{7}$/i;
            if (epicRegex.test(epic)) {
                res.json({ 
                    found: true, 
                    details: { name: 'Aaditya Kumar (Mocked)', age: 31, gender: 'Male', ac: 'Simulated AC', part: '01', station: 'Simulated Polling Booth' } 
                });
            } else {
                res.json({ found: false });
            }
        }
    }, 800);
});

// 🚨 Endpoint: Report Incident
const incidentReports = [];
app.post('/api/report-incident', (req, res) => {
    const { type, desc, location } = req.body;
    
    const newReport = {
        id: Date.now(),
        type,
        desc,
        location,
        timestamp: new Date().toISOString()
    };
    
    incidentReports.push(newReport);
    console.log("New Incident Reported:", newReport);

    // Simulate processing delay
    setTimeout(() => {
        res.json({ success: true, message: "Report securely logged." });
    }, 1000);
});

// 🤖 Endpoint: AI Assistant Chat
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    let response = "Namaste! I am your Indian Election Assistant. I can help you understand the voting process, the Election Commission, EVMs, or you can take a quiz!";

    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('register') || lowerMessage.includes('voter id') || lowerMessage.includes('epic')) {
        response = "To vote in India, you need to be a citizen, 18+ years old, and have your name on the Electoral Roll. You can apply for a Voter ID (EPIC) online via the NVSP portal or the Voter Helpline App.";
    } else if (lowerMessage.includes('evm') || lowerMessage.includes('machine')) {
        response = "Electronic Voting Machines (EVMs) are used to cast votes in India. They consist of a Control Unit and a Balloting Unit. You simply press the blue button next to your chosen candidate's symbol.";
    } else if (lowerMessage.includes('vvpat')) {
        response = "VVPAT stands for Voter Verifiable Paper Audit Trail. It allows you to verify that your vote was cast correctly by printing a slip that is visible through a transparent window for 7 seconds.";
    } else if (lowerMessage.includes('election commission') || lowerMessage.includes('eci')) {
        response = "The Election Commission of India (ECI) is an autonomous constitutional authority responsible for administering election processes in India at national and state levels.";
    } else if (lowerMessage.includes('nota')) {
        response = "NOTA stands for 'None Of The Above'. It is an option on the EVM that allows you to officially register a vote of rejection for all candidates contesting in your constituency.";
    } else if (lowerMessage.includes('incident') || lowerMessage.includes('report') || lowerMessage.includes('capture')) {
        response = "You can report election malpractices like Booth Capturing or Voter Intimidation securely via the 'Report Incident' tab on the left. It will capture your GPS location for accurate reporting.";
    } else if (lowerMessage.includes('search') || lowerMessage.includes('roll')) {
        response = "You can check if your name is on the electoral roll by navigating to the 'Electoral Search' tab and entering your EPIC number.";
    }

    setTimeout(() => {
        res.json({ reply: response });
    }, 500);
});

// 🏆 Leaderboard State (In-memory)
let leaderboard = [
    { name: "Arjun V.", score: 1450, rank: 1 },
    { name: "Sanya M.", score: 1320, rank: 2 },
    { name: "Rohan D.", score: 1280, rank: 3 },
    { name: "Kiran P.", score: 1210, rank: 4 },
    { name: "Meera K.", score: 1150, rank: 5 }
];

// Populate more mock data to show Top 50 potential
for (let i = 6; i <= 50; i++) {
    leaderboard.push({
        name: `Citizen ${i}`,
        score: Math.floor(Math.random() * 1000) + 100,
        rank: i
    });
}

// 🏆 Endpoint: Get Leaderboard
app.get('/api/leaderboard', (req, res) => {
    res.json(leaderboard.slice(0, 50));
});

// 🏆 Endpoint: Submit Score
app.post('/api/submit-score', (req, res) => {
    const { name, score } = req.body;
    if (!name || score === undefined) return res.status(400).json({ error: "Name and score required" });

    leaderboard.push({ name, score, rank: 0 });
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Re-assign ranks
    leaderboard.forEach((user, index) => {
        user.rank = index + 1;
    });

    leaderboard = leaderboard.slice(0, 50); // Keep only Top 50
    res.json({ success: true, rank: leaderboard.find(u => u.name === name)?.rank || 51 });
});

// Fallback route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
