const vscode = require('vscode');
const axios = require('axios');

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

/**
 * Activates the extension.
 * @param {vscode.ExtensionContext} context - The context in which the extension is activated.
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.getAISuggestions', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;

            const codeSnippet = document.getText(selection) || document.lineAt(selection.active.line).text;

            const suggestions = await getSuggestionsFromLLM(codeSnippet);

            vscode.window.showInformationMessage(suggestions);
        }
    });

    context.subscriptions.push(disposable);
}

/**
 * Gets suggestions from the local LLM using the Ollama API.
 * @param {string} codeSnippet - The code snippet to analyze.
 * @returns {Promise<string>} The suggestion from the LLM.
 */
async function getSuggestionsFromLLM(codeSnippet) {
    try {
        const response = await axios.post(OLLAMA_API_URL, {
            model: 'llama2-uncensored',
            prompt: `Analyze and suggest improvements for the following code:\n\n${codeSnippet}`,
            stream: false
        });

        const suggestion = response.data.response.trim();
        return suggestion;
    } catch (error) {
        console.error('Error communicating with the Ollama API:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        return 'Unable to retrieve suggestions from the LLM.';
    }
}

/**
 * Deactivates the extension.
 */
function deactivate() {}

// Export the activate and deactivate functions
module.exports = {
    activate,
    deactivate
};
