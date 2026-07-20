
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.error("Erreur: OPENAI_API_KEY n'est pas définie dans .env");
    process.exit(1);
}

async function testOpenAI() {
    console.log("Test de l'API OpenAI avec la clé : " + apiKey.substring(0, 10) + "...");
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': 'Bearer ' + apiKey 
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                max_tokens: 50,
                messages: [{
                    role: 'user',
                    content: 'Bonjour, ceci est un test de connexion. Réponds simplement "Test réussi".'
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Échec de l'appel API OpenAI. Statut:", response.status);
            console.error("Détails de l'erreur:", errorText);
            return;
        }

        const data = await response.json();
        console.log("Succès ! Réponse de l'IA :", data.choices[0].message.content);
    } catch (error) {
        console.error("Erreur réseau ou interne :", error.message);
    }
}

testOpenAI();
