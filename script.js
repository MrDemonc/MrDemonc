const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let waves = [];

class Wave {
    constructor(y, amplitude, length, speed, color) {
        this.y = y;
        this.amplitude = amplitude;
        this.length = length;
        this.speed = speed;
        this.color = color;
        this.offset = Math.random() * Math.PI * 2;
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(0, this.y);

        for (let x = 0; x < width; x++) {
            const waveY = this.y + Math.sin(x * this.length + this.offset) * this.amplitude;
            ctx.lineTo(x, waveY);
        }

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.15;
        ctx.stroke();
    }

    update() {
        this.offset += this.speed;
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initWaves();
}

function initWaves() {
    waves = [];
    const colors = ['#767f4c', '#8a945d', '#5d633c', '#98a16b'];
    const waveCount = 15;
    for (let i = 0; i < waveCount; i++) {
        const y = (height / waveCount) * i + (Math.random() * 50 - 25);
        waves.push(new Wave(
            y,
            20 + Math.random() * 30,
            0.001 + Math.random() * 0.002,
            0.005 + Math.random() * 0.01,
            colors[Math.floor(Math.random() * colors.length)]
        ));
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    waves.forEach(w => {
        w.update();
        w.draw();
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
resize();
animate();

// Typing Effect
function typeWriter(element, text, speed, callback) {
    let i = 0;
    element.innerHTML = '';
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }
    type();
}

// Birthday Countdown
function updateBirthdayCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    function update() {
        const now = new Date();
        let nextBirthday = new Date(now.getFullYear(), 0, 22); // Enero is 0

        if (now > nextBirthday) {
            nextBirthday.setFullYear(now.getFullYear() + 1);
        }

        const diff = nextBirthday - now;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    update();
    setInterval(update, 1000);
}

// Initialize immediately
updateBirthdayCountdown();

// Local Time
function updateLocalTime() {
    const timeElement = document.getElementById('local-time');
    if (!timeElement) return;

    function update() {
        const now = new Date();

        // Get hour in Ecuador
        const optionsHour = { timeZone: 'America/Guayaquil', hour: 'numeric', hour12: false };
        const ecuadorHour = parseInt(new Intl.DateTimeFormat('en-US', optionsHour).format(now));

        // Update Time
        const optionsTime = {
            timeZone: 'America/Guayaquil',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        const formatter = new Intl.DateTimeFormat('en-US', optionsTime);
        timeElement.innerText = formatter.format(now);

        // Update Status Text
        const statusElement = document.getElementById('status-text');
        if (statusElement) {
            const isAwake = ecuadorHour >= 7 && ecuadorHour < 23;
            statusElement.innerText = isAwake ? 'Awake' : 'Sleeping';

            // Optional: change pulse color if sleeping
            const pulse = document.querySelector('.status-pulse');
            if (pulse) {
                pulse.style.background = isAwake ? '#4caf50' : '#f44336';
                pulse.style.boxShadow = isAwake ? '0 0 0 rgba(76, 175, 80, 0.4)' : '0 0 0 rgba(244, 67, 54, 0.4)';
            }
        }
    }

    update();
    setInterval(update, 60000);
}

// Fetch GitHub Stats
async function fetchGitHubStats() {
    const repoCards = document.querySelectorAll('[data-repo]');

    repoCards.forEach(async (card) => {
        const repo = card.getAttribute('data-repo');
        const starsElement = card.querySelector('.repo-stars');
        const forksElement = card.querySelector('.repo-forks');

        try {
            const response = await fetch(`https://api.github.com/repos/${repo}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            if (starsElement) starsElement.innerText = data.stargazers_count;
            if (forksElement) forksElement.innerText = data.forks_count;
        } catch (error) {
            console.error(`Error fetching stats for ${repo}:`, error);
            if (starsElement) starsElement.innerText = '0';
            if (forksElement) forksElement.innerText = '0';
        }
    });
}

// Time Ago Helper
function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

// Fetch Last Commits for Carousel
async function fetchLastCommits() {
    const carousel = document.getElementById('commits-carousel');
    if (!carousel) return;

    const repos = [
        'MrDemonc/PROJECT-LichUI',
        'MrDemonc/Lune',
        'MrDemonc/Beta_FW_Mergue',
        'MrDemonc/SendFiles',
        'MrDemonc/Vaulta',
        'MrDemonc/android_device_samsung_a54x'
    ];

    try {
        const commitPromises = repos.map(async (repo) => {
            const response = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`);
            if (!response.ok) return null;
            const data = await response.json();
            return {
                repo: repo.split('/')[1],
                commit: data[0]
            };
        });

        const results = await Promise.all(commitPromises);

        // Clear loading skeleton
        carousel.innerHTML = '';

        results.filter(r => r !== null).forEach(item => {
            const card = document.createElement('a');
            card.href = item.commit.html_url;
            card.target = '_blank';
            card.className = 'commit-card glass';

            card.innerHTML = `
                <span class="commit-repo">${item.repo}</span>
                <p class="commit-msg">"${item.commit.commit.message}"</p>
                <div class="commit-date">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>${timeAgo(item.commit.commit.author.date)}</span>
                </div>
            `;
            carousel.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching commits:', error);
        carousel.innerHTML = '<div class="commit-card glass"><p>Error loading activity.</p></div>';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    updateBirthdayCountdown();
    updateLocalTime();
    fetchGitHubStats(); // Fetch repo stats
    fetchLastCommits(); // Fetch last commits for carousel
    const nameElement = document.getElementById('typing-name');
    const subtitleElement = document.getElementById('typing-subtitle');

    if (nameElement && subtitleElement) {
        const nameText = nameElement.innerText;
        const subtitleText = subtitleElement.innerText;

        typeWriter(nameElement, nameText, 100, () => {
            typeWriter(subtitleElement, subtitleText, 50);
        });
    }
});

// Cursor spotlight for cards
document.addEventListener('mousemove', (e) => {
    document.querySelectorAll('.card, .repo-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});
