const content = document.getElementById("content");

// LOAD PAGE FUNCTION ------------------------------------------

async function loadPage(page) {
    const response = await fetch(`pages/${page}.html`);
    const html = await response.text();
    content.innerHTML = html;
  
    // LOAD BLOG IF BLOG --------------------------------------------------
    if (page === "blog") loadBlogList();

    // INIT MAP IF MAP ----------------------------------------------------
    else if (page === "places") {
        const mapDiv = document.getElementById("map");
        if (mapDiv) {
            const map = L.map('map').setView([20, 0], 2);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            const landmarks = [
                { city: "New York", coords: [40.7128, -74.0060], description: ""},
                { city: "London", coords: [51.5074, -0.1278], description: "" },
                { city: "Boston", coords: [48.8566, 2.3522], description: "" },
                { city: "Pittsburgh", coords: [35.6895, 139.6917], description: "" },
            ];

            const icon_image = L.icon({
                iconUrl: 'img/cheese_cursor.png', // your icon image
                iconSize: [32, 32],
                iconAnchor: [16, 32], // tip of the marker
                popupAnchor: [0, -32]
            });

            landmarks.forEach(l => {
                L.marker(l.coords, { icon: icon_image })
                 .addTo(map)
                 .bindPopup(`<b>${l.city}</b><br>${l.description}`);
            });
        }
    }
}  

// SELECT CONTENT USING MENU -----------------------------------------

document.querySelectorAll(".menu button").forEach(button => {
    button.addEventListener("click", async () => {
        const page = button.dataset.page;

        const response = await fetch(`pages/${page}.html`);
        const html = await response.text();

        content.innerHTML = html;

        loadPage(page);
    });
});


// DISPLAY LASTFM -------------------------------------------------

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

// DISPLAY CURRENT TIME ---------------------------------------------------------

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
    timeElement.textContent = `current time ${timeString} (EST)`;
}

// Update every second
setInterval(updateTime, 1000);
updateTime(); // initial call

// TRACK CURRENT PAGE --------------------------------------------------

const buttons = document.querySelectorAll(".menu button");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        // Remove 'active' from all buttons
        buttons.forEach(b => b.classList.remove("active"));

        // Add 'active' to the clicked button
        btn.classList.add("active");
    });
});


// CURSOR FOLLOWER ---------------------------------------------------------

const follower = document.getElementById("cursor-follower");

// mouse position
let mouseX = 0;
let mouseY = 0;

// follower position
let followerX = 0;
let followerY = 0;

const offsetX = 20;
const offsetY = 20;

// how fast it catches up (lower = slower, higher = snappier)
const speed = 0.08;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateFollower() {
  // smooth interpolation (lerp)
  followerX += (mouseX - followerX) * speed;
  followerY += (mouseY - followerY) * speed;

  follower.style.transform =
  `translate(${followerX + offsetX}px, ${followerY + offsetY}px)`;

  requestAnimationFrame(animateFollower);
}

animateFollower();


// LOAD BLOG ---------------------------------------------------------

async function loadBlogList() {
    const res = await fetch("blog/posts.json");
    const posts = await res.json();
  
    const list = document.getElementById("blog-list");
    if (!list) return;
  
    list.innerHTML = posts.map(post => `
        <div class="blog-preview">
            <p>${post.date}
            <button onclick="loadPost('${post.id}')">${post.title}</button></p>
        </div>
    `).join("");
}
  
  
async function loadPost(id) {
    const res = await fetch("blog/posts.json");
    const posts = await res.json();
  
    const post = posts.find(p => p.id === id);
    if (!post) return;
  
    content.innerHTML = `
        <button class="back-button" onclick="loadPage('blog')">← Back</button>
        <article class="blog-post">
            <h3>${post.title}</h3>
            <small>${post.date}</small>
            ${post.content}
        </article>
    `;
}
  


