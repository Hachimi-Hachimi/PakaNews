function formatTimestamp(timestamp: number) {
    return new Date(timestamp * 1000).toLocaleString();
}

export default {
    formatTimestamp
}