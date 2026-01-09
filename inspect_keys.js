const https = require('https');

const url = "https://webnodejs.chittorgarh.com/cloud/report/data-read/82/1/1/2026/2025-26/0/all/0?search=&v=16-05";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.reportTableData) {
                const allKeys = new Set();
                json.reportTableData.forEach(item => {
                    Object.keys(item).forEach(k => allKeys.add(k));
                });

                console.log("KEYS_LIST_START");
                [...allKeys].sort().forEach(k => console.log(k));
                console.log("KEYS_LIST_END");
            } else {
                console.log("No reportTableData found");
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
        }
    });
});
