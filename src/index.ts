import Unity from "./unity";
import Utils from "./utils";
import Loader from "./loader";
import type { Article } from "./types";

const allTabBtn = document.getElementById("allTabBtn")!;
const gameTabBtn = document.getElementById("gameTabBtn")!;
const newsEntries = document.getElementById("newsEntries")!;

enum Tab {
    All,
    Game
}

var currentTab = Tab.All;
function onTabClick(tab: Tab) {
    if (loading) return;

    Unity.call("snd_sfx_UI_tab_01");
    if (currentTab == tab) return;
    
    currentTab = tab;
    loadNews();
    updateTabBtns();
}

function updateTabBtns() {
    switch (currentTab) {
        case Tab.All:
            allTabBtn.classList.add("selected");
            gameTabBtn.classList.remove("selected");
            break;

        case Tab.Game:
            gameTabBtn.classList.add("selected");
            allTabBtn.classList.remove("selected");
            break;
    }
}

allTabBtn.addEventListener("click", () => onTabClick(Tab.All));
gameTabBtn.addEventListener("click", () => onTabClick(Tab.Game));

function appendNewsEntry(article: Article) {
    const entry = document.createElement("a");
    entry.role = "button";
    entry.href = import.meta.env.BASE_URL + "details/?id=" + article.announce_id;
    entry.className = "news-entry";
    entry.addEventListener("click", () => {
        Unity.call("snd_sfx_UI_Tap_01");
        // Store in session storage so the details page won't have to load it
        sessionStorage.setItem("article", JSON.stringify(article));
    });

    const labelBox = document.createElement("div");
    labelBox.className = "news-label-box";
    entry.appendChild(labelBox);

    const label = document.createElement("div");
    label.className = "label";
    label.style.backgroundColor = article.label_color;
    label.innerText = article.label_name_en;
    labelBox.appendChild(label);

    if (article.update_at) {
        const updatedTime = document.createElement("div");
        updatedTime.className = "updated-time";
        updatedTime.innerText = "【Updated】" + Utils.formatTimestamp(article.update_at);
        labelBox.appendChild(updatedTime);
    }

    const title = document.createElement("h1");
    title.className = "news-title";
    title.innerText = article.title_english;
    entry.appendChild(title)

    if (article.image) {
        const img = document.createElement("img");
        img.src = article.image;
        entry.appendChild(img);
    }

    const postTime = document.createElement("div");
    postTime.className = "news-post-time";
    postTime.innerText = Utils.formatTimestamp(article.post_at);
    entry.appendChild(postTime);

    newsEntries.appendChild(entry);
}

function appendMoreBtn() {
    const moreBtn = document.createElement("div");
    moreBtn.className = "news-entry more-btn";
    moreBtn.innerText = "▼ Load more";
    moreBtn.addEventListener("click", () => {
        if (loading) return;
        Unity.call("snd_sfx_UI_Tap_01");
        loadNews(true).then(() => newsEntries.removeChild(moreBtn));
    });
    newsEntries.appendChild(moreBtn);
}

const POST_COUNT = 20;
let offset = 0;
let loading = false;
async function loadNews(loadMore = false) {
    if (loading) return;
    loading = true;

    if (!loadMore) {
        offset = 0;
        newsEntries.classList.remove("show");
    }

    let endpoint: string;
    switch (currentTab) {
        case Tab.All:
            endpoint = `https://umapyoi.net/api/v1/news/latest/${POST_COUNT}/${offset}`;
            break;

        case Tab.Game:
            endpoint = `https://umapyoi.net/api/v1/news/latest/${POST_COUNT}/${offset}/label/1`;
            break;
    }

    Loader.show();
    try {
        const res = await fetch(endpoint);
        const data: Article[] = await res.json();

        if (!loadMore) {
            newsEntries.innerHTML = "";
            newsEntries.scrollTo(0, 0);
        };
        for (const article of data) {
            appendNewsEntry(article);
        }
        appendMoreBtn();

        let state: State | null = history.state;
        updateState({
            scrollTop: newsEntries.scrollTop,
            tab: currentTab,
            offset,
            data: [...(state && loadMore ? state.data : []), ...data]
        });

        newsEntries.classList.add("show");
    }
    finally {
        Loader.hide();
        loading = false;
    }

    offset += POST_COUNT;
}

interface State {
    scrollTop: number,
    tab: Tab,
    offset: number,
    data: Article[]
}

function updateState(state: State) {
    history.replaceState(state, "", location.href);
}

function restoreState() {
    let state: State | null = history.state;
    if (!state) return false;

    for (const article of state.data) {
        appendNewsEntry(article);
    }
    appendMoreBtn();
    newsEntries.scrollTo(0, state.scrollTop);
    newsEntries.classList.add("show");

    offset = state.offset;

    currentTab = state.tab;
    updateTabBtns();

    return true;
}

function init() {
    if (!restoreState()) {
        loadNews();
        updateTabBtns();
    }

    newsEntries.addEventListener("scroll", () => {
        let state: State | null = history.state;
        updateState({
            scrollTop: newsEntries.scrollTop,
            tab: currentTab,
            offset,
            data: state?.data ?? []
        });
    });
}
init();