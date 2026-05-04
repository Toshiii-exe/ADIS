// Simulates OSINT and Breach data gathering

const mockBreachData = {
    "target@company.com": [
        { source: "Apollo.io Scraping 2021", type: "Email, Title, Phone", impact: "Low" },
        { source: "Cit0Day 2020", type: "Email, Password (MD5)", impact: "High" }
    ],
    "jdoe_admin": [
        { source: "Collection #1", type: "Email, Password (Plaintext)", impact: "Critical" },
        { source: "Adobe 2013", type: "Email, Password Hint", impact: "Medium" }
    ]
};

const simulateBreachExposure = (email) => {
    if (!email) return [];
    
    if (mockBreachData[email]) {
        return mockBreachData[email];
    }
    
    // Procedural generation for unknown emails
    const dumps = ["RockYou2024", "LinkedIn 2012", "Canva 2019", "Unknown Dark Web Combo List", "MySpace 2008", "Naz.API 2024"];
    const impacts = ["Low", "Medium", "High", "Critical"];
    const types = ["Email, Username", "Email, Password Hash", "Email, Password (Plaintext), Name", "Email, Location, IP"];
    
    const results = [];
    const count = Math.floor(Math.random() * 4); // 0 to 3 breaches
    for (let i = 0; i < count; i++) {
        results.push({
            source: dumps[Math.floor(Math.random() * dumps.length)],
            type: types[Math.floor(Math.random() * types.length)],
            impact: impacts[Math.floor(Math.random() * impacts.length)],
        });
    }
    return [...new Map(results.map(item => [item.source, item])).values()]; // Deduplicate by source
};

const simulateOSINT = (username) => {
    if (!username) return { footprintScore: 0, platforms: [] };
    
    const platforms = [];
    const possible = ["GitHub", "Twitter / X", "Reddit", "StackOverflow", "Gaming Forums", "Keybase", "LinkedIn", "Medium"];
    let footprintScore = 0;

    possible.forEach(p => {
        if (Math.random() > 0.4) { // Higher chance for richer footprint
            platforms.push(p);
            footprintScore += p === "LinkedIn" || p === "GitHub" ? 15 : 5;
        }
    });

    return {
        footprintScore,
        platforms,
        reusedUsername: platforms.length > 3
    };
};

const checkPasswordHygiene = (entropyScore) => {
    // 0 = terrible, 100 = excellent (based on user self-report or simulated frontend logic)
    const score = entropyScore || Math.floor(Math.random() * 100);
    let vulnerability = "Low";
    if (score < 30) vulnerability = "Critical";
    else if (score < 60) vulnerability = "Medium";

    return { score, vulnerability };
};

const assessBehavioralRisk = (answers) => {
    if (!answers) return { score: 50, notes: "No data" };
    // Example logic based on generic questionnaire
    let score = 0;
    if (answers.reusedPasswords) score += 40;
    if (answers.clickedPhishing) score += 30;
    if (!answers.uses2FA) score += 30;

    return {
        score,
        susceptibility: score > 60 ? "High" : score > 30 ? "Medium" : "Low"
    };
};

module.exports = {
    simulateBreachExposure,
    simulateOSINT,
    checkPasswordHygiene,
    assessBehavioralRisk
};
