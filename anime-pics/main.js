let images = [];

let mousedownTimestamp;
let scrolledY = 0;
let activeNumber = 0;

let cooldown = 0;
let cdms = 5000;

let collecting = false;
let aborted = false;

let after = [];
let page = 1;

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

function merge(arr) {
  let result = [];
  const sorted = arr.sort((a, b) => b.length - a.length);
  const max = sorted[0].length;

  for (let i = 0; i < max; i++) {
    for (arr of sorted) {
      if (arr[i]) result.push(arr[i]);
    }
  }

  return result;
}

function changeActiveNumber(e) {
  const button = parseInt(e.target.id);
  if (isNaN(button) || button === activeNumber) return;

  document.getElementById(button.toString()).style.backgroundColor = "rgb(45, 45, 45)";
  document.getElementById(activeNumber.toString()).style.backgroundColor = "rgb(60, 60, 60)";
  activeNumber = button;

  images = [];

  after = [];
  page = 1;

  document.getElementById("result").innerHTML = "";
}

function setup() {
  document.addEventListener("click", (e) => changeActiveNumber(e));
  document.getElementById("0").style.backgroundColor = "rgb(45, 45, 45)";
  // getImages();

  setInterval(() => {
    if (images.length === 0 && cooldown < Date.now() && !collecting && !aborted) {
      getImages();
      page++;
      return;
    }

    if (collecting || !images[0] || document.getElementById("result").scrollHeight - window.scrollY > 20000) return;

    let img = document.createElement("img");
    img.src = images[0][1];
    img.className = "image";
    img.setAttribute("onclick", `window.open("${images[0][0]}");`);

    document.getElementById("result").appendChild(img);

    images[0] = undefined;

    images = images.filter((i) => i !== undefined);
  }, 500);
}

async function getImages() {
  cooldown = Date.now() + cdms;
  const requestNumber = activeNumber;
  collecting = true;

  let results = [];

  if (activeNumber === 0) {
    //REDDIT
    //"ecchi", "hentai", "HENTAI_GIF", "rule34", "Rule34LoL"
    const subreddits = ["ecchi", "hentai", "rule34", "Rule34LoL"];
    const limit = "15";

    for (let i = 0; i < subreddits.length; i++) {
      results.push(fetch(`https://www.reddit.com/r/${subreddits[i]}/best.json?raw_json=1&limit=${limit}&after=${after[i]}`));
    }
  } else if (activeNumber === 1) {
    //MOEBOORU
    const limit = "100";
    //score%3A>20+
    const tags = `-rating%3Asafe`;

    results.push(fetch(`https://yande.re/post.json?limit=${limit}&page=${page}&tags=${tags}`));
  }

  results = await Promise.all(results);

  if (requestNumber !== activeNumber) return;

  for (let i = 0; i < results.length; i++) {
    results[i] = results[i].json();
  }

  results = await Promise.all(results);

  if (activeNumber === 0) {
    //REDDIT
    after = results.map((a) => a.data.children.sort((a, b) => b.data.created - a.data.created).at(-1).data.name);
    const posts = results.map((a) => a.data.children).flat();

    for (const post of posts) {
      if (post.data.stickied) continue;
      let postImages = [];

      if (post.data.preview) {
        //post.data.preview - Sorted Media: image.source.url
        for (const image of post.data.preview.images) {
          if (image.variants.gif) {
            postImages.push(["https://www.reddit.com" + post.data.permalink, image.variants.gif.source.url]);
          } else {
            postImages.push(["https://www.reddit.com" + post.data.permalink, image.source.url]);
          }
        }
      } else if (post.data.gallery_data) {
        //post.data.gallery_data - Sort Key
        //post.data.media_metadata - Unsorted Media: image.s.u
        const ids = post.data.gallery_data.items.map((i) => i.media_id);

        let sorted = [];
        for (let i = 0; i < ids.length; i++) {
          sorted[i] = post.data.media_metadata[ids[i]];
        }

        for (const image of sorted) {
          if (image.v) {
            postImages.push(["https://www.reddit.com" + post.data.permalink, image.v.gif.s.u]);
          } else {
            postImages.push(["https://www.reddit.com" + post.data.permalink, image.s.u]);
          }
        }
      }

      if (postImages.length) images.push(postImages);
    }
  } else if (activeNumber === 1) {
    //MOEBOORU

    results = results.flat().sort((a, b) => b.created_at - a.created_at);

    for (let i = 0; i < results.length; i++) {
      const post = results[i];
      results[i] = [[`https://yande.re/post/show/${post.id}`, `https://cwickks-api.up.railway.app/proxy?q=${post.sample_url}`]];
    }

    images = results;
  }

  images = [].concat.apply([], images);

  collecting = false;
}

window.onload = setup();
