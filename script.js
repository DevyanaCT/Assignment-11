// Initialize state
let thoughts = JSON.parse(localStorage.getItem('thoughts')) || [];
let currentMood = localStorage.getItem('currentMood') || 'calm';
let dailyQuote = '';

// DOM Elements
const thoughtInput = document.getElementById('thoughtInput');
const thoughtsGrid = document.getElementById('thoughtsGrid');
const toggleThemeBtn = document.getElementById('toggleThemeBtn');
const addThoughtBtn = document.getElementById('addThoughtBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const inspireMeBtn = document.getElementById('inspireMeBtn');
const visualizeBtn = document.getElementById('visualizeBtn');
const moodChart = document.getElementById('moodChart');
const inspirationQuote = document.getElementById('inspirationQuote');
const notification = document.getElementById('notification');
const moodButtons = document.querySelectorAll('.mood-btn');

// Mood-based color schemes
const moodColors = {
    happy: '#FFD700',
    calm: '#87CEEB',
    energetic: '#FF4500',
    productive: '#32CD32',
    creative: '#FF1493'
};

// Show notification
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

// Toggle theme (DOM manipulation #1)
toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    showNotification('✨ Theme transformed!');
});

// Add thought with current mood (DOM manipulation #2)
addThoughtBtn.addEventListener('click', () => {
    const text = thoughtInput.value.trim();
    if (text) {
        const thought = {
            id: Date.now(),
            text,
            mood: currentMood,
            timestamp: new Date().toISOString(),
            color: moodColors[currentMood]
        };
        thoughts.unshift(thought);
        thoughtInput.value = '';
        renderThoughts();
        saveToLocalStorage();
        showNotification('💭 Thought captured!');
    }
});

// Shuffle layout (DOM manipulation #3)
shuffleBtn.addEventListener('click', () => {
    const cards = Array.from(thoughtsGrid.children);
    cards.forEach(card => {
        card.style.order = Math.floor(Math.random() * cards.length);
        card.style.transform = `rotate(${Math.random() * 6 - 3}deg)`;
    });
    showNotification('🔄 Layout shuffled!');
});

// Fetch and display inspiration (DOM manipulation #4)
async function fetchInspiration() {
    try {
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        inspirationQuote.innerHTML = `
            <p>"${data.content}"</p>
            <small>- ${data.author}</small>
        `;
        inspirationQuote.classList.add('floating');
    } catch (error) {
        inspirationQuote.textContent = "✨ Create your own inspiration today!";
    }
}

inspireMeBtn.addEventListener('click', () => {
    fetchInspiration();
    showNotification('✨ New inspiration loaded!');
});

// Visualize moods (DOM manipulation #5)
visualizeBtn.addEventListener('click', () => {
    const moodCounts = thoughts.reduce((acc, thought) => {
        acc[thought.mood] = (acc[thought.mood] || 0) + 1;
        return acc;
    }, {});

    const maxCount = Math.max(...Object.values(moodCounts));

    moodChart.innerHTML = Object.entries(moodCounts)
        .map(([mood, count]) => `
            <div class="mood-bar" style="
                height: ${(count / maxCount) * 100}%;
                background-color: ${moodColors[mood]};
                width: 50px;
                margin: 0 5px;
                border-radius: 5px;
                transition: height 0.5s;
            ">
                <div class="mood-label">${mood}</div>
                <div class="mood-count">${count}</div>
            </div>
        `)
        .join('');

    showNotification('📊 Mood visualization updated!');
});

// Set current mood
moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        currentMood = btn.dataset.mood;
        moodButtons.forEach(b => b.style.transform = 'scale(1)');
        btn.style.transform = 'scale(1.2)';
        document.documentElement.style.setProperty('--primary-color', moodColors[currentMood]);
        showNotification(`Mood set to ${currentMood}! 🎭`);
    });
});

// Render thoughts
function renderThoughts() {
    thoughtsGrid.innerHTML = thoughts.map(thought => `
        <div class="thought-card" style="background: linear-gradient(45deg, ${thought.color}22, transparent)">
            <p>${thought.text}</p>
            <div class="thought-footer">
                <span>${new Date(thought.timestamp).toLocaleDateString()}</span>
                <span>${thought.mood}</span>
            </div>
            <button onclick="deleteThought(${thought.id})" class="delete-btn">×</button>
        </div>
    `).join('');
}

// Delete thought
function deleteThought(id) {
    thoughts = thoughts.filter(t => t.id !== id);
    renderThoughts();
    saveToLocalStorage();
    showNotification('Thought deleted! 🗑️');
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('thoughts', JSON.stringify(thoughts));
    localStorage.setItem('currentMood', currentMood);
}

// Initial setup
renderThoughts();
fetchInspiration();
visualizeBtn.click();

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        addThoughtBtn.click();
    }
});

// Add ambient background animation
const galaxyBackground = document.querySelector('.galaxy-background');
document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    const moveX = (x / window.innerWidth) * 50 - 25; // Max move 25% to the left or right
    const moveY = (y / window.innerHeight) * 50 - 25; // Max move 25% up or down
    galaxyBackground.style.transform = `translate(${moveX}px, ${moveY}px)`;
});

// Responsive behavior (Dynamic Layout Adjustments)
function adjustLayoutForScreen() {
    const width = window.innerWidth;

    // Adjust the number of columns in thoughts grid based on screen width
    if (width < 600) {
        thoughtsGrid.style.gridTemplateColumns = '1fr'; // Single column layout for small screens
    } else if (width < 900) {
        thoughtsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)'; // Two columns for medium screens
    } else {
        thoughtsGrid.style.gridTemplateColumns = 'repeat(3, 1fr)'; // Three columns for larger screens
    }

    // Adjust font sizes dynamically
    document.documentElement.style.fontSize = width < 600 ? '14px' : '16px';

    // Adjust textarea height for smaller screens
    if (width < 600) {
        thoughtInput.style.minHeight = '80px'; // Smaller height for textarea on small screens
    } else {
        thoughtInput.style.minHeight = '120px'; // Larger height for textarea on larger screens
    }
}

// Listen for window resize events
window.addEventListener('resize', adjustLayoutForScreen);

// Initial layout adjustment
adjustLayoutForScreen();

