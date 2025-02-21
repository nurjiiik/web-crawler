module.exports = {
    getRandomProxy: () => {
      const proxies = process.env.PROXY_LIST?.split(',') || [];
      return proxies[Math.floor(Math.random() * proxies.length)];
    }
  };