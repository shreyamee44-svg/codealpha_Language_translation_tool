document.getElementById('translate-btn').addEventListener('click', async () => {
    const text = document.getElementById('input-text').value;
    const source = document.getElementById('source-lang').value;
    const target = document.getElementById('target-lang').value;
    const outputTextArea = document.getElementById('output-text');

    if (!text.trim()) {
        alert("Please enter some text to translate.");
        return;
    }

    outputTextArea.placeholder = "Translating...";
    outputTextArea.value = "";

    try {
        // A highly reliable public mirror that doesn't strictly block local files
    const response = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=" 
        + (source === "auto" ? "auto" : source) + "&tl=" + target + "&dt=t&q=" + encodeURIComponent(text));

    if (!response.ok) {
        throw new Error("API request failed");
    }

    const data = await response.json();
    
    // Google's free gtx endpoint returns a deeply nested array
    // The first element of the first array contains the translated string
    outputTextArea.value = data[0][0][0];

} catch (error) {
    console.error("Error:", error);
    outputTextArea.placeholder = "Translation failed. Try again later.";
}
        
});

// FEATURE: Copy to Clipboard
document.getElementById('copy-btn').addEventListener('click', () => {
    const outputText = document.getElementById('output-text').value;
    if (outputText) {
        navigator.clipboard.writeText(outputText);
        alert("Translated text copied to clipboard!");
    }
});

// --- TEXT TO SPEECH ---

// 1. Initialize and preload voices early (Crucial for Chrome/Edge)
let webVoices = [];
function loadVoices() {
    webVoices = window.speechSynthesis.getVoices();
}
loadVoices();
if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
}

// 2. Updated Speak Event Listener
document.getElementById('speak-btn').addEventListener('click', () => {
    const outputText = document.getElementById('output-text').value;
    const targetLang = document.getElementById('target-lang').value;

    if (!outputText) return;

    // Clear any stuck speech queues immediately
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(outputText);
    
    // Explicitly enforce the exact locale string 
    if (targetLang === 'hi') {
        utterance.lang = 'hi-IN';
        
        // Force-search the internal browser array for an actual Hindi engine
        const hindiVoice = webVoices.find(voice => 
            voice.lang === 'hi-IN' || 
            voice.lang === 'hi-HI' || 
            voice.name.includes('Hindi') || 
            voice.name.includes('हिन्दी')
        );
        
        if (hindiVoice) {
            utterance.voice = hindiVoice;
        }
    } else {
        // Fallback for other languages
        const voiceMapping = { 'en': 'en-US', 'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE' };
        utterance.lang = voiceMapping[targetLang] || targetLang;
        const matchingVoice = webVoices.find(voice => voice.lang === utterance.lang);
        if (matchingVoice) utterance.voice = matchingVoice;
    }

    // Speak the text
    window.speechSynthesis.speak(utterance);
});