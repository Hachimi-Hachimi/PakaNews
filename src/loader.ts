const loader = document.getElementById("loader")!;

function show() {
    loader.classList.add("show");
}

function hide() {
    loader.classList.remove("show");
}

export default {
    show,
    hide
}