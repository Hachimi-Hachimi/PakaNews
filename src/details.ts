import Utils from "./utils";
import Loader from "./loader";
import Unity from "./unity";
import type { Article } from "./types";
import DOMPurify from "dompurify";

const contentsInner = document.getElementById("contentsInner")!;
const label = document.getElementById("label")!;
const postTime = document.getElementById("postTime")!;
const title = document.getElementById("title")!;
const message = document.getElementById("message")!;

async function getArticle(): Promise<Article> {
    const idParam = new URLSearchParams(location.search).get("id");
    if (!idParam) throw new Error("No id specified");
    const id = Number(idParam);
    if (isNaN(id)) throw new Error("Invalid id");

    const storedArticleItem = sessionStorage.getItem("article");
    if (storedArticleItem) {
        let article: Article = JSON.parse(storedArticleItem);
        if (article.announce_id == id) return article;
    }

    const res = await fetch("https://umapyoi.net/api/v1/news/" + id);
    return await res.json();
}

async function init() {
    Unity.call("showBackButton");

    const article = await getArticle();

    label.style.backgroundColor = article.label_color;
    label.innerText = article.label_name_en;

    postTime.innerText = Utils.formatTimestamp(article.post_at);
    title.innerText = article.title_english;
    let messageHTML = article.message_english;
    if (article.image && !messageHTML.startsWith("<figure><img")) {
        messageHTML = `<figure><img src="${article.image}"></figure>${messageHTML}`;
    }
    message.innerHTML = DOMPurify.sanitize(messageHTML);

    for (const node of message.children) {
        if (node.tagName == "A") {
            const anchor = node as HTMLAnchorElement;
            const href = anchor.href;
            anchor.href = "javascript:void(0)";
            anchor.addEventListener("click", () => {
                Unity.call("externalbrowser_" + href)
            });
        }
    }
}

Loader.show();
init()
.catch(e => {
    console.error(e);
    message.innerText = "Failed to load article: " + e;
})
.finally(() => {
    contentsInner.classList.add("show");
    Loader.hide();
});