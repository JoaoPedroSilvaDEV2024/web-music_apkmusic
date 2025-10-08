const entradaUrlServidor = document.getElementById("serverUrl");
const botaoConectar = document.getElementById("connectBtn");
const elementoStatus = document.getElementById("status");
const listaMusicasEl = document.getElementById("songList");
const audioEl = document.getElementById("audio");
const tocandoAgoraEl = document.getElementById("nowPlaying");
const coverImageEl = document.getElementById("coverImage");

const playPauseBtn = document.getElementById("playPauseBtn");
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const volumeControl = document.getElementById("volumeControl");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const modeSelect = document.getElementById("modeSelect");
const playerEl = document.querySelector(".player");

const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const historyList = document.getElementById("historyList");

const likeBtn = document.getElementById("likeBtn");
const favoritesList = document.getElementById("favoritesList");
const toggleVisualizerBtn = document.getElementById("toggleVisualizerBtn");
const equalizerEl = document.getElementById("equalizer");

// Novos elementos para artista
const artistImageEl = document.getElementById("artistImage");
const artistBioEl = document.getElementById("artistBio");
const artistTagsEl = document.getElementById("artistTags");

// API Last.fm
const API_KEY = "569fdfa347c66116c9c2a489618afe39"; // 🔑 coloque sua chave aqui

let musicas = [];
let base = "";
let musicaAtualIndex = 0;
let isShuffle = false;
let isRepeat = false;
let historico = [];
let favoritos = [];
let visualizerOn = false;

const capasMusicas = {
    "Father John Misty - Real Love Baby (Lyrics)": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYIVsgQzvIV_BTH689OrlFOkhIW7knL9I20Q&s",
    "Bobby McFerrin - Don't Worry Be Happy (Official Music Video)": "https://i.discogs.com/h6riFeINj1LlAns4j76qDHN3J0WK84dBWoBwn4J8QG0/rs:fit/g:sm/q:90/h:596/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTQwNzkz/NzktMTY3NDA3MzUy/NS0yNzQxLmpwZWc.jpeg",
    "Summer Walker - White Tee (Lyrics)": "https://i.ytimg.com/vi/SBYQLyXKLB8/maxresdefault.jpg",
    "Chris Brown - Say Goodbye (Official HD Video)": "https://upload.wikimedia.org/wikipedia/en/6/6d/Cbsaygoodbye.jpg",
    "Aerosmith-Jaded": "https://www.vstopbrasil.com.br/wp-content/uploads/jaded-aerosmith-20242910142604202813-20242910144129292813-300x300.jpg",
    "Ariana Grande, Justin Bieber - Stuck with U": "https://upload.wikimedia.org/wikipedia/uk/d/dc/Justin_Bieber_and_Ariana_Grande_-_Stuck_with_You.png",
    "GipsyKings-Bamboleo": "https://i.discogs.com/f6KlB7LnYoYiJhk81u_ftPWsFn9reWhPsyKIDJfAw-o/rs:fit/g:sm/q:40/h:300/w:300/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTUzODAw/NjgtMTM5MTk0OTM4/OS04NjA2LmpwZWc.jpeg",
    "GipsyKings-DjobiDjoba": "https://m.media-amazon.com/images/I/61iswP8e+gL._UF1000,1000_QL80_.jpg",
    "MC Kevin - Cavalo de Troia (GR6 Filmes) Djay W": "https://images.genius.com/473461f5b142651e230a247d0236c6f2.1000x1000x1.png",
    "Henrique e Juliano - SALA DE ESPERA - DVD Menos é Mais - IG henriqueejuliano": "https://i.ytimg.com/vi/aQxweSxAbo4/maxresdefault.jpg",
    "Shut up My Moms Calling (Sped up)": "https://i1.sndcdn.com/artworks-g8r7BTLdbXG9-0-t500x500.jpg",
    "The Delicious Last Course": "https://assets-prd.ignimgs.com/2021/12/20/cupheaddeliciouslast-1640043161876.jpg",
    "Kyan - NÓS É RUIM E O CABELO AJUDA": "https://cdn-images.dzcdn.net/images/cover/07fa1f8e403e0b4d1483ad53f798ca93/0x1900-000000-80-0-0.jpg",
    "Só Rock - Major RD, Young Ganni, Sos 🎸 Prod: @xavier2bit": "https://i.ytimg.com/vi/B0JQ2wsuiv4/maxresdefault.jpg",
    "Michael Jackson - Don’t Stop 'Til You Get Enough (Official Video)": "https://upload.wikimedia.org/wikipedia/pt/e/e6/Don%27t_Stop_%27Til_You_Get_Enough.jpg",
    "Stop Crying Your Heart Out (Remastered)": "https://cdn-images.dzcdn.net/images/cover/d28b859c76511ddc4ea905a928adb592/500x500.jpg"
};

// --- Funções auxiliares ---
function juntarUrl(base, relativo) {
    try { return new URL(relativo, base).href; }
    catch { return base.replace(/\/+$/, "") + "/" + relativo.replace(/^\/+/, ""); }
}

async function buscarJSON(url) {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    return resposta.json();
}

function definirStatus(mensagem) {
    elementoStatus.textContent = mensagem;
}

// --- Conectar ao servidor Flask ---
botaoConectar.addEventListener("click", async () => {
    base = entradaUrlServidor.value.trim().replace(/\/$/, "");
    if (!base) {
        definirStatus("Informe a URL do servidor.");
        return;
    }
    definirStatus("Conectando…");
    try {
        const saude = await buscarJSON(juntarUrl(base, "/api/saude"));
        definirStatus(`Conectado. ${saude.count} músicas disponíveis.`);
        musicas = await buscarJSON(juntarUrl(base, "/api/musicas"));
        renderizarMusicas();
    } catch (erro) {
        definirStatus("Falha ao conectar. Verifique a URL e a rede.");
        console.error(erro);
    }
});

// --- Renderizar lista de músicas ---
function renderizarMusicas() {
    listaMusicasEl.innerHTML = "";
    if (!musicas || musicas.length === 0) {
        listaMusicasEl.innerHTML = "<li>Nenhuma música encontrada no servidor.</li>";
        return;
    }
    musicas.forEach((musica, index) => {
        const li = document.createElement("li");
        const capaEl = document.createElement("img");
        capaEl.src = capasMusicas[musica.title] || "https://via.placeholder.com/100?text=Sem+Capa";
        capaEl.alt = "Capa da música";
        capaEl.className = "list-cover";

        const blocoMeta = document.createElement("div");
        blocoMeta.className = "meta";
        const tituloEl = document.createElement("div");
        tituloEl.className = "title"; tituloEl.textContent = musica.title || "(Sem título)";
        const artistaEl = document.createElement("div");
        artistaEl.className = "artist"; artistaEl.textContent = musica.artist || "Desconhecido";

        blocoMeta.appendChild(tituloEl); blocoMeta.appendChild(artistaEl);

        const botaoTocar = document.createElement("button");
        botaoTocar.textContent = "Tocar";
        botaoTocar.addEventListener("click", () => tocarMusica(index));

        li.appendChild(capaEl); li.appendChild(blocoMeta); li.appendChild(botaoTocar);
        listaMusicasEl.appendChild(li);
    });
}

// --- Tocar música ---
function tocarMusica(index) {
    musicaAtualIndex = index;
    const musica = musicas[index];
    audioEl.src = musica.url?.startsWith("http") ? musica.url : juntarUrl(base, musica.url);
    audioEl.play().catch(console.error);
    playPauseBtn.textContent = "⏸️";
    tocandoAgoraEl.textContent = `🎶 Tocando: ${musica.title} — ${musica.artist}`;
    coverImageEl.src = capasMusicas[musica.title] || "https://via.placeholder.com/80?text=Sem+Capa";
    coverImageEl.classList.add("playing");

    historico.unshift(`${musica.title} — ${musica.artist}`);
    if (historico.length > 5) historico.pop();
    atualizarHistorico();

    // 🔎 Busca informações do artista no Last.fm
    buscarArtistaLastFm(musica.artist);
}

// --- Atualizar histórico ---
function atualizarHistorico() {
    historyList.innerHTML = "";
    historico.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        historyList.appendChild(li);
    });
}

// --- Atualizar favoritos ---
function atualizarFavoritos() {
    favoritesList.innerHTML = "";
    favoritos.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        favoritesList.appendChild(li);
    });
}

// --- Play / Pause ---
playPauseBtn.addEventListener("click", () => {
    if (audioEl.paused) {
        audioEl.play();
        playPauseBtn.textContent = "⏸️";
        coverImageEl.classList.add("playing");
        if (visualizerOn) equalizerEl.style.display = "flex";
    } else {
        audioEl.pause();
        playPauseBtn.textContent = "▶️";
        coverImageEl.classList.remove("playing");
        equalizerEl.style.display = "none";
    }
});

// --- Controles ---
prevBtn.addEventListener("click", () => {
    if (musicas.length === 0) return;
    musicaAtualIndex = (musicaAtualIndex - 1 + musicas.length) % musicas.length;
    tocarMusica(musicaAtualIndex);
});

nextBtn.addEventListener("click", () => {
    if (musicas.length === 0) return;
    if (isShuffle) {
        musicaAtualIndex = Math.floor(Math.random() * musicas.length);
    } else {
        musicaAtualIndex = (musicaAtualIndex + 1) % musicas.length;
    }
    tocarMusica(musicaAtualIndex);
});

shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.style.color = isShuffle ? "yellow" : "#1db954";
});

repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;
    repeatBtn.style.color = isRepeat ? "yellow" : "#1db954";
    audioEl.loop = isRepeat;
});

likeBtn.addEventListener("click", () => {
    const musica = musicas[musicaAtualIndex];
    const item = `${musica.title} — ${musica.artist}`;
    if (!favoritos.includes(item)) {
        favoritos.push(item);
        atualizarFavoritos();
    }
});

toggleVisualizerBtn.addEventListener("click", () => {
    visualizerOn = !visualizerOn;
    equalizerEl.innerHTML = "";
    if (visualizerOn) {
        equalizerEl.style.display = "flex";
        for (let i = 0; i < 20; i++) {
            const bar = document.createElement("div");
            bar.className = "bar";
            bar.style.animationDelay = `${i * 0.1}s`;
            equalizerEl.appendChild(bar);
        }
    } else {
        equalizerEl.style.display = "none";
    }
});

// --- Progresso e volume ---
audioEl.addEventListener("timeupdate", () => {
    progressBar.value = (audioEl.currentTime / audioEl.duration) * 100 || 0;
    currentTimeEl.textContent = formatarTempo(audioEl.currentTime);
    totalTimeEl.textContent = formatarTempo(audioEl.duration);
});
progressBar.addEventListener("input", () => {
    audioEl.currentTime = (progressBar.value / 100) * audioEl.duration;
});
volumeControl.addEventListener("input", () => {
    audioEl.volume = volumeControl.value;
});

audioEl.addEventListener("ended", () => {
    coverImageEl.classList.remove("playing");
    equalizerEl.style.display = "none";
    if (isRepeat) {
        tocarMusica(musicaAtualIndex);
    } else {
        nextBtn.click();
    }
});

function formatarTempo(segundos) {
    if (isNaN(segundos)) return "00:00";
    const m = Math.floor(segundos / 60).toString().padStart(2, "0");
    const s = Math.floor(segundos % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

modeSelect.addEventListener("change", () => {
    playerEl.className = `player ${modeSelect.value}`;
});

// --- Buscar dados do artista na Last.fm ---
async function buscarArtistaLastFm(artistName) {
    try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${API_KEY}&format=json`;
        const resp = await fetch(url);
        const data = await resp.json();

        if (data.artist) {
            artistImageEl.src = data.artist.image?.[2]?.["#text"] || "https://via.placeholder.com/150?text=Sem+Imagem";
            artistBioEl.innerHTML = data.artist.bio?.summary || "Nenhuma biografia encontrada.";
            artistTagsEl.innerHTML =
                data.artist.tags?.tag.map(t => `<span>#${t.name}</span>`).join(" ") || "";
        } else {
            artistBioEl.textContent = "Artista não encontrado no Last.fm.";
            artistImageEl.src = "";
            artistTagsEl.innerHTML = "";
        }
    } catch (err) {
        console.error("Erro ao buscar artista:", err);
        artistBioEl.textContent = "Erro ao buscar informações do artista.";
    }
}
