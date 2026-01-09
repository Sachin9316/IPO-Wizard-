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
                    const openDate = new Date(item['~Issue_Open_Date']);
                    const closeDate = new Date(item['~IssueCloseDate']);
                    const listingDate = new Date(item['~ListingDate']);

                    // Formatting function for dates
                    const formatDate = (date) => {
                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
                    };

                    return {
                        name: stripHtml(item['Company']),
                        dates: {
                            open: formatDate(openDate),
                            close: formatDate(closeDate),
                            listing: formatDate(listingDate)
                            // Note: 'Allotment Date' is not present in the keys found. 
                            // The user mentioned "All four Dates", but only 3 date keys (~Issue_Open_Date, ~IssueCloseDate, ~ListingDate) are visible in the inspector output.
                        },
                        issue_price: stripHtml(item['Issue Price (Rs.)']),
                        issue_size_cr: stripHtml(item['Total Issue Amount (Incl.Firm reservations) (Rs.cr.)']),
                        listing_at: stripHtml(item['Listing at']),
                        lead_manager: stripHtml(item['Left Lead Manager']),
                        image: item['~compare_image'] || 'N/A'
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
