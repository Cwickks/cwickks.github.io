const loader = `<div class="loader">Loading...</div>`;
let user;

async function setup() {
  document.body.innerHTML = "";

  let input = document.createElement("input");
  input.className = "input";
  input.type = "text";
  input.placeholder = "MyAnimeList.net Username";

  let done = document.createElement("button");
  done.className = "done";
  done.textContent = "Done";

  let inputContainer = document.createElement("div");
  inputContainer.className = "inputContainer";

  inputContainer.appendChild(input);
  inputContainer.appendChild(done);
  document.body.appendChild(inputContainer);

  done.addEventListener("click", (e) => {
    e.preventDefault();
    user = input.value;
    if (!user) return;
    track(user);
    document.body.innerHTML = loader;
  });

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      done.click();
    }
  });
}

async function track(user) {
  console.log(name);
  let animes = await fetch(`https://cwickks-api.up.railway.app/animetracker?f=home&d=${user}`);
  document.body.innerHTML = "";
  animes = await animes.json();

  for (const anime of animes) {
    let animeContainer = document.createElement("div");
    animeContainer.className = "animeContainer";

    let img = document.createElement("img");
    img.src = anime.main_picture;
    img.className = "main_picture";

    let rightContainer = document.createElement("div");
    rightContainer.className = "rightContainer";

    let h2 = document.createElement("h2");
    h2.innerText = anime.title;
    h2.className = "title";

    rightContainer.appendChild(h2);

    for (const episode of anime.episodes) {
      let a = document.createElement("a");
      a.href = episode.magnet;
      episode.downloaded ? (a.className = "episode watched") : (a.className = "episode");
      a.innerText = `EP${episode.episode}`;
      a.setAttribute(
        "onclick",
        `{this.style.background = "green";fetch("https://cwickks-api.up.railway.app/animetracker?f=update&d=${user + anime.title + episode.episode}");};`
      );

      rightContainer.appendChild(a);
    }

    animeContainer.appendChild(img);
    animeContainer.appendChild(rightContainer);

    document.body.appendChild(animeContainer);
  }
}

window.onload = setup();
