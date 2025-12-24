const content = document.getElementById("content");

document.querySelectorAll(".menu button").forEach(button => {
    button.addEventListener("click", async () => {
        const page = button.dataset.page;

        const response = await fetch(`pages/${page}.html`);
        const html = await response.text();

        content.innerHTML = html;
    });
});

const username = "YOUR_LASTFM_USERNAME";
const apiKey = "YOUR_API_KEY";

const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`;

fetch(url)
.then(res => res.json())
.then(data => {
    const track = data.recenttracks.track[0];
    const artist = track.artist["#text"];
    const name = track.name;

    // Detect if it’s currently playing
    const nowPlayingText = track["@attr"]?.nowplaying 
        ? `Now playing: ${name} — ${artist}`
        : `Last played: ${name} — ${artist}`;
        
    document.getElementById("now-playing").textContent = nowPlayingText;
})

.catch(err => {
    console.error(err);
    document.getElementById("now-playing").textContent = "Could not load track";
});


