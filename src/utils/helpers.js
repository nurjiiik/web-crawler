module.exports = {
    normalizeUrl: (url) => {
      try {
        const urlObj = new URL(url);
        return urlObj.origin + urlObj.pathname.toLowerCase().replace(/\/$/, '');
      } catch {
        return null;
      }
    },
  
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
    chunkArray: (arr, size) => 
      Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size))
  };