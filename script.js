/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

const workerUrl = "https://loreal-chatbot-worker.polo-hatching-calm.workers.dev/";

// Conversation history for OpenAI API
let conversationHistory = [
  {
    role: "system",
    content: "You are a helpful L'Oréal beauty assistant. Provide helpful advice about skincare, makeup, and beauty products."
  }
];

// Set initial message
chatWindow.innerHTML = '';
displayMessage("👋 Hello! How can I help you with your beauty questions today?", 'ai');

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const userMessage = userInput.value.trim();
  if (!userMessage) return;
  
  // Display user message
  displayMessage(userMessage, 'user');
  
  // Add user message to conversation history
  conversationHistory.push({
    role: "user",
    content: userMessage
  });
  
  // Clear input
  userInput.value = '';
  
  // Show loading state
  displayMessage("Thinking...", 'ai');
  
  try {
    // Fetch response from worker (OpenAI API)
    await fetchResponse();
  } catch (error) {
    // Remove loading message and show error
    removeLastMessage();
    displayMessage("Sorry, I encountered an error. Please try again.", 'ai');
    console.error('Error:', error);
  }
});

async function fetchResponse() {
  try {
    console.log('Sending request to worker...'); // Debug log
    
    // Send request to worker with full conversation history
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversationHistory, // Worker expects 'messages' property
      }),
    });

    console.log('Response status:', response.status); // Debug log
    console.log('Response headers:', response.headers); // Debug log

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Response data:', data); // Debug log
    
    // Extract response following OpenAI API structure
    const aiResponse = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
    
    console.log('AI Response:', aiResponse); // Debug log
    
    // Add AI response to conversation history
    conversationHistory.push({
      role: "assistant",
      content: aiResponse
    });
    
    // Remove loading message and display AI response
    removeLastMessage();
    displayMessage(aiResponse, 'ai');
    
  } catch (error) {
    console.error('Detailed fetch error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw error; // Re-throw to be handled by form submit
  }
}

function displayMessage(message, sender) {
  const messageElement = document.createElement('div');
  messageElement.className = `msg ${sender}`;
  messageElement.textContent = message;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeLastMessage() {
  const lastMessage = chatWindow.lastElementChild;
  if (lastMessage) {
    lastMessage.remove();
  }
}