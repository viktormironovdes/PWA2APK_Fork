// music logic

const soundtrack = new Audio("music/midday paws.wav"); // if someone else copies it they can have a different custom track they own
soundtrack.loop = true;
soundtrack.volume = 0; // fade in

let played = false;

function playSoundtrack() {
    if (!played) {
        soundtrack.play().catch((err) => {
            console.error("Couldn't play audio:", err);
        });
        played = true;
        fadeIn(soundtrack, 1, 5000); // fade to full volume in 5 seconds
    }
}

// fade-in function: audio, targetVolume (0-1), duration in ms
function fadeIn(audio, targetVolume, duration) {
    const stepTime = 50; // ms
    const steps = duration / stepTime;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.min(audio.volume + volumeStep, targetVolume);
        if (currentStep >= steps) clearInterval(fadeInterval);
    }, stepTime);
}

document.addEventListener("click", playSoundtrack);
document.addEventListener("keydown", playSoundtrack);
document.addEventListener("touchstart", playSoundtrack);
