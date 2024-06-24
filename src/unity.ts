function call(t: string) {
    var e = document.createElement("iframe");
    e.setAttribute("src", "unity:" + t);
    document.documentElement.appendChild(e);
    e.parentNode!.removeChild(e);
}

export default {
    call
}