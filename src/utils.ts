function formatTimestamp(timestamp: number) {
    return new Date(timestamp * 1000).toLocaleString(undefined, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'});
}

export default {
    formatTimestamp
}