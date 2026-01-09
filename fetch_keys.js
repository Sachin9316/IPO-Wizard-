const https = require('https');

const url = "https://webnodejs.chittorgarh.com/cloud/report/data-read/82/1/1/2026/2025-26/0/all/0?search=&v=16-05";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.reportTableData && json.reportTableData.length > 0) {
                console.log(JSON.stringify(Object.keys(json.reportTableData[0])));
            }
        } catch (e) { console.error(e); }
    });
});
