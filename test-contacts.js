const fetch = require('node-fetch') || globalThis.fetch;

(async () => {
  try {
    const res = await fetch("http://194.146.12.71:8008/api/contacts");
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text.substring(0, 300));
  } catch (e) {
    console.error(e);
  }
})();
