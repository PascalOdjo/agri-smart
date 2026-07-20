import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Erreur: GEMINI_API_KEY n'est pas définie dans .env");
    process.exit(1);
}

async function testGemini() {
    console.log("Test de l'API Gemini avec la clé : " + apiKey.substring(0, 10) + "...");
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Test de connexion. Réponds uniquement avec le mot EXACT : 'SUCCES'." }
                    ]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Échec API Gemini. Statut:", response.status);
            console.error("Erreur:", errorText);
            return;
        }

        const data = await response.json();
        console.log("Données brutes de l'API:", JSON.stringify(data, null, 2));
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        console.log("Texte extrait:", text);
    } catch (error) {
        console.error("Erreur réseau :", error.message);
    }
}

testGemini();
