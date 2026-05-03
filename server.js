const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Mock Database for Search ---
const mockVoterDatabase = {
    'ABC1234567': { name: 'Rahul Sharma', age: 29, gender: 'Male', ac: 'New Delhi', part: '45', station: 'Govt Boys Sr Sec School, Room 2' },
    'XYZ9876543': { name: 'Priya Patel', age: 34, gender: 'Female', ac: 'Ahmedabad West', part: '12', station: 'Saraswati Vidya Mandir' }
};

// 🗺️ API: National Democracy Pulse Data
app.get('/api/pulse-data', (req, res) => {
    const states = [
        { id: 'MH', name: 'Maharashtra', engagement: 'High', topSearch: 'Voter Registration', users: 12450 },
        { id: 'UP', name: 'Uttar Pradesh', engagement: 'Critical', topSearch: 'EVM Security', users: 32100 },
        { id: 'KA', name: 'Karnataka', engagement: 'High', topSearch: 'Booth Locator', users: 8900 },
        { id: 'DL', name: 'Delhi', engagement: 'Extreme', topSearch: 'ECI Assistant', users: 15600 },
        { id: 'TN', name: 'Tamil Nadu', engagement: 'Medium', topSearch: 'NOTA Options', users: 7200 }
    ];
    res.json(states);
});

// 🔍 API: Electoral Search
app.post('/api/search-voter', (req, res) => {
    const { epic } = req.body;
    setTimeout(() => {
        const voter = mockVoterDatabase[epic.toUpperCase()] || { 
            name: 'Aaditya Kumar (Mocked)', age: 31, gender: 'Male', ac: 'Simulated AC', part: '01', station: 'Simulated Polling Booth' 
        };
        res.json({ found: true, details: voter });
    }, 600);
});

// 🚨 API: Report Incident
app.post('/api/report-incident', (req, res) => {
    console.log("Incident Logged:", req.body);
    setTimeout(() => res.json({ success: true }), 800);
});

// 🤖 API: AI Assistant Chat
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    let response = "Namaste! I can help you with the voting process, maps, or your Civic Passport!";
    const lower = message.toLowerCase();
    
    if (lower.includes('map') || lower.includes('pulse')) response = "The Democracy Pulse map shows real-time engagement across India! You can see hotspots of voter awareness by hovering over the states.";
    if (lower.includes('passport') || lower.includes('stamp')) response = "Your Civic Passport is a record of your democratic journey. Earn stamps by completing the quiz, searching the roll, and exploring the app!";
    
    setTimeout(() => res.json({ reply: response }), 400);
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
