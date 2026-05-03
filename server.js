const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

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
    }

    setTimeout(() => {
        res.json({ reply: response });
    }, 500);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
