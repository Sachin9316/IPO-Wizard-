const https = require('https');

const url = "https://webnodejs.chittorgarh.com/cloud/report/data-read/82/1/1/2026/2025-26/0/all/0?search=&v=16-05";

const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
};

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.reportTableData) {
                const formatted = json.reportTableData.map(item => {
                    const open = stripHtml(item['Opening Date']);
                    const close = stripHtml(item['Closing Date']);
                    const dateStr = (open && close) ? `${open} - ${close}` : (open || close || 'N/A');

                    return {
                        name: stripHtml(item['Company']),
                        dates: dateStr,
                        issue_price: stripHtml(item['Issue Price'] || item['Price'] || 'N/A'),
                        issue_size_cr: stripHtml(item['Issue Size'] || item['Issue Size (Rs Cr)'] || 'N/A'),
                        listing_at: stripHtml(item['Listing at']),
                        lead_manager: stripHtml(item['Left Lead Manager'])
                    };
                });
                console.log(JSON.stringify(formatted, null, 2));
            } else {
                console.log("[]");
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
        }
    });
}).on('error', (e) => {
    console.error(e);
});
