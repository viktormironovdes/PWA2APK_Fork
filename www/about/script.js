// Dark/Light Mode Toggle
const darkModeBtn = document.getElementById('darkModeBtn');
const darkModeIcon = document.getElementById('darkModeIcon');
let isDark = true;
function setTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    darkModeBtn.textContent = dark ? 'dark' : 'light';
    darkModeBtn.prepend(darkModeIcon);
    if (dark) {
        darkModeIcon.querySelector('circle').setAttribute('stroke', '#2d2a5a');
        darkModeIcon.querySelector('#moonPath').setAttribute('fill', '#f2b134');
    } else {
        darkModeIcon.querySelector('circle').setAttribute('stroke', '#4b3fd9');
        darkModeIcon.querySelector('#moonPath').setAttribute('fill', '#4b3fd9');
    }
}
darkModeBtn.onclick = () => {
    isDark = !isDark;
    setTheme(isDark);
};
setTheme(true);

// Animate dev-alias hover for fun
document.querySelector('.dev-alias').addEventListener('mouseenter', e => {
    e.target.style.filter = 'brightness(1.25)';
});
document.querySelector('.dev-alias').addEventListener('mouseleave', e => {
    e.target.style.filter = '';
});

// Music player logic
let musicStarted = false;
const audio = document.getElementById('bg-music');
const playBtn = document.getElementById('player-play');
const volSlider = document.getElementById('player-volume');
const statusLabel = document.getElementById('player-status');

document.addEventListener('click', function () {
    if (!musicStarted) {
        audio.volume = volSlider.value;
        audio.play();
        playBtn.textContent = "⏸️";
        statusLabel.textContent = `volume: ${Math.round(audio.volume*100)}%`;
        musicStarted = true;
    }
}, { once: true });

playBtn.addEventListener('click', function (e) {
    if (audio.paused) {
        audio.play();
        playBtn.textContent = "⏸️";
    } else {
        audio.pause();
        playBtn.textContent = "▶️";
    }
});

volSlider.addEventListener('input', function () {
    audio.volume = volSlider.value;
    statusLabel.textContent = `volume: ${Math.round(audio.volume*100)}%`;
});

audio.addEventListener('ended', function() {
    playBtn.textContent = "▶️";
});
