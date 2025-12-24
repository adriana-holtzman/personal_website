const content = document.getElementById("content");

// SELECT CONTENT USING MENU

document.querySelectorAll(".menu button").forEach(button => {
    button.addEventListener("click", async () => {
        const page = button.dataset.page;

        const response = await fetch(`pages/${page}.html`);
        const html = await response.text();

        content.innerHTML = html;
    });
});

// DISPLAY LASTFM

const username = "evilcat923";
const apiKey = "0d358011f511af9c7a3f5438631adfa3";

const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`;

fetch(url)
.then(res => res.json())
.then(data => {
    const track = data.recenttracks.track[0];
    const artist = track.artist["#text"];
    const name = track.name;

    // Detect if it’s currently playing
    const nowPlayingText = track["@attr"]?.nowplaying 
        ? `listening to ${name} by ${artist}`
        : `last listened to ${name} by ${artist}`;

    document.getElementById("now-playing").textContent = nowPlayingText;
})

.catch(err => {
    console.error(err);
    document.getElementById("now-playing").textContent = "listening to: [could not load track]";
});

// DISPLAY CURRENT TIME

const timeElement = document.getElementById("time");

function updateTime() {
    const options = {
        timeZone: "America/New_York", // IANA naming
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true // true = 12-hour format, false = 24-hour
    };
    
    const timeString = new Date().toLocaleTimeString("en-US", options);
    timeElement.textContent = `current time: ${timeString} (EST)`;
}

// Update every second
setInterval(updateTime, 1000);
updateTime(); // initial call


