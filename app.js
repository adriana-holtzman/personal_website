const content = document.getElementById("content");

// LOAD PAGE FUNCTION ------------------------------------------

async function loadPage(page) {
    console.log("Loading page:", page);
    destroyGallery();

    const response = await fetch(`pages/${page}.html`);
    const html = await response.text();
    content.innerHTML = html;
  
    // LOAD BLOG IF BLOG --------------------------------------------------
    if (page === "blog") loadBlogList();

    // LOAD GALLERY IF CONSUMED --------------------------------------------------
    else if (page === "media_consumed") {

        // Small delay to ensure DOM is ready
        setTimeout(() => {
            initGallery();
        }, 0);
    }

}  

// SELECT CONTENT USING MENU -----------------------------------------

const buttons = document.querySelectorAll(".menu-bar button");
buttons.forEach(button => {
    button.addEventListener("click", () => {
        // Remove 'active' from all buttons
        buttons.forEach(b => b.classList.remove("active"));

        // Add 'active' to the clicked button
        button.classList.add("active");

        // load new page
        loadPage(button.dataset.page);
    });    
});




// DISPLAY LASTFM -------------------------------------------------

const username = "evilcat923";
const apiKey = "0d358011f511af9c7a3f5438631adfa3";

const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`;

let lastTrackId = null;

async function updateNowPlaying() {

    fetch(url)
    .then(res => res.json())
    .then(data => {
        const track = data.recenttracks.track[0];
        const artist = track.artist["#text"];
        const name = track.name;
        const image = track.image.find(img => img.size === "extralarge")["#text"];

        // build a simple ID to detect change
        const trackId = `${track.artist["#text"]}-${track.name}`;

        if (trackId === lastTrackId) return; // no change

        lastTrackId = trackId;

        // Detect if it’s currently playing
        const nowPlayingText = track["@attr"]?.nowplaying 
            ? `\u266B listening to ${name} by ${artist}`
            : `\u266B last listened to ${name} by ${artist}`;

        document.getElementById("track").textContent = nowPlayingText;

        document.getElementById("album-art").src = image || "fallback.jpg";
    })

    .catch(err => {
        console.error(err);
        document.getElementById("now-playing").textContent = "\u266B listening to: [could not load track]";
    });
}

// poll every 10 seconds
setInterval(updateNowPlaying, 10000);

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
    
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", options);

    const seconds = now.getSeconds("en-US", options);
    const minutes = now.getMinutes("en-US", options);
    const hours = now.getHours("en-US", options) % 12;

    const secondDeg = seconds * 6; // 360 / 60
    const minuteDeg = minutes * 6 + seconds * 0.1;
    const hourDeg = hours * 30 + minutes * 0.5;

    document.querySelector(".second").style.transform =
        `translateX(-50%) rotate(${secondDeg}deg)`;

    document.querySelector(".minute").style.transform =
        `translateX(-50%) rotate(${minuteDeg}deg)`;

    document.querySelector(".hour").style.transform =
        `translateX(-50%) rotate(${hourDeg}deg)`;

    timeElement.textContent = `\u{1F552} current time ${timeString} (EST)`;
}

// Update every second
setInterval(updateTime, 1000);
updateTime(); // initial call


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

function extractTitleFromMarkdown(md) {
    const match = md.match(/^\s*#\s+(.*)/m);
    if (match) return match[1].trim();
    return "Untitled Post"; // fallback
}  

async function loadBlogList() {
    const res = await fetch("blog/posts.json");
    const posts = await res.json();
  
    const list = document.getElementById("blog-list");
    if (!list) return;
  
    list.innerHTML = "";
  
    for (const post of posts) {
        const mdRes = await fetch(`blog/${post.id}.md`);
        const md = await mdRes.text();
        
        // extract title (first # heading)
        const title = extractTitleFromMarkdown(md);
  
        list.innerHTML += `
        <div class="blog-preview">
            <p>${post.date}
            <button onclick="loadPost('${post.id}')">${title}</button></p>
        </div>
        `;
    }
}
  
async function loadPost(filename) {
    const res = await fetch(`blog/${filename}.md`);
    const md = await res.text();
  
    const html = marked.parse(md);
  
    content.innerHTML = `
      <button onclick="loadPage('blog')">← Back</button>
      
      <article class="blog-post">
        ${html}
      </article>
      <div class="signature">♡ adriana</div>
    `;
}

// LOAD MEDIA GALLERY ---------------------------------------------------------

const imageGroups = {
    visual: [
        "img/visual-art-consumed/monet.PNG",
        "img/visual-art-consumed/roulin.PNG",
        "img/visual-art-consumed/sunday-in-the-park.PNG",
        "img/visual-art-consumed/picasso.PNG",
        "img/visual-art-consumed/netherlands.PNG",
        "img/visual-art-consumed/woman-newspaper.PNG",
        "img/visual-art-consumed/spanish-woman.PNG",
        "img/visual-art-consumed/mary-lamb.PNG",
        "img/visual-art-consumed/peabody-essex.PNG",
        "img/visual-art-consumed/boy-on-horned-animal.PNG",
        "img/visual-art-consumed/IMG_7989.PNG",
        "img/visual-art-consumed/IMG_7987.PNG",
        "img/visual-art-consumed/IMG_7986.PNG"
    ]
    // Add more topics and images here as needed
};

async function initGallery() {
    console.log("initGallery ran");

    const gallery = document.getElementById("gallery");
    console.log("gallery:", gallery);

    if (!gallery) return;

    // Collect all images from all topics
    const allImages = [];
    for (const topic in imageGroups) {
        allImages.push(...imageGroups[topic]);
    }

    // Create a card for each image
    allImages.forEach(src => {
        const card = document.createElement("div");
        card.className = "card";

        const img = document.createElement("img");
        img.src = src;
        img.loading = "lazy";

        card.appendChild(img);
        gallery.appendChild(card);
    });
}

function destroyGallery() {
    console.log("destroyGallery ran");
    // Clear gallery content when switching pages
    const gallery = document.getElementById("gallery");
    if (gallery) {
        gallery.innerHTML = "";
    }
}

  


