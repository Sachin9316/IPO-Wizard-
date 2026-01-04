import { IPOData } from '../types/ipo';
import moment from 'moment';

export const mapBackendToFrontend = (backendData: any): IPOData => {
    const isSME = backendData.ipoType?.toUpperCase() === 'SME';

    // Determine status based on dates if not explicitly provided or map status string
    let status: 'Open' | 'Closed' | 'Upcoming' = 'Upcoming';

    // Normalize backend status to UPPERCASE for comparison
    const backendStatus = backendData.status ? backendData.status.toUpperCase() : '';

    const now = moment();
    const openDate = moment(backendData.open_date);
    const closeDate = moment(backendData.close_date);

    if (now.isBefore(openDate)) {
        status = 'Upcoming';
    } else if (now.isAfter(closeDate)) {
        status = 'Closed';
    } else {
        status = 'Open';
    }

    // Override if backend status is explicit and matches our types
    if (backendStatus === 'OPEN') status = 'Open';
    if (backendStatus === 'CLOSED') status = 'Closed';
    if (backendStatus === 'UPCOMING') status = 'Upcoming';
    if (backendStatus === 'LISTED') status = 'Closed'; // Listed IPOs are closed for subscription

    // GMP logic
    let gmpValue = "₹0 (0%)";
    if (backendData.gmp && backendData.gmp.length > 0) {
        const latestGMP = backendData.gmp[backendData.gmp.length - 1];
        const price = latestGMP.price || 0;

        // Calculate percentage based on Issue Price (Upper Band)
        let percentage = 0;
        const basePrice = backendData.max_price || backendData.min_price || 0;

        if (basePrice > 0) {
            percentage = (price / basePrice) * 100;
        }
        gmpValue = `₹${price} (${percentage.toFixed(1)}%)`;
    }

    return {
        id: backendData._id || backendData.id,
        name: backendData.companyName,
        type: isSME ? 'SME' : 'Mainboard',
        priceRange: (backendData.min_price && backendData.max_price)
            ? `₹${backendData.min_price} - ₹${backendData.max_price}`
            : `₹${backendData.lot_price}`,
        openDate: moment(backendData.open_date).format('YYYY-MM-DD'),
        closeDate: moment(backendData.close_date).format('YYYY-MM-DD'),
        status: status,
        logoUrl: backendData.icon,
        gmp: gmpValue,
        subscription: `${backendData.subscription?.total || 0}x`,
        lotSize: backendData.lot_size?.toString() || '0',
        issueSize: backendData.issueSize ? `₹${backendData.issueSize} Cr` : 'N/A',
        dates: {
            offerStart: moment(backendData.open_date).format('DD MMM'),
            offerEnd: moment(backendData.close_date).format('DD MMM'),
            allotment: moment(backendData.allotment_date).format('DD MMM'),
            refund: moment(backendData.refund_date).format('DD MMM'),
            listing: moment(backendData.listing_date).format('DD MMM')
        },
        rawDates: {
            offerStart: backendData.open_date,
            offerEnd: backendData.close_date,
            allotment: backendData.allotment_date,
            refund: backendData.refund_date,
            listing: backendData.listing_date
        },
        isAllotmentOut: backendData.isAllotmentOut || false,
        // For debugging: Force links for Zomato if backend has them missing
        rhpUrl: backendData.rhp_pdf || (backendData.companyName === 'Zomato Limited' ? 'https://www.sebi.gov.in/sebi_data/attachdocs/jul-2021/1625546682662.pdf' : undefined),
        drhpUrl: backendData.drhp_pdf || (backendData.companyName === 'Zomato Limited' ? 'https://www.sebi.gov.in/sebi_data/attachdocs/apr-2021/1619586156942.pdf' : undefined),
        registrarLink: backendData.registrarLink || undefined,
        swot: backendData.swot ? {
            strengths: backendData.swot.strengths || [],
            weaknesses: backendData.swot.weaknesses || [],
            opportunities: backendData.swot.opportunities || [],
            threats: backendData.swot.threats || []
        } : undefined,
        subscriptionDetails: backendData.subscription ? {
            qib: backendData.subscription.qib || 0,
            nii: backendData.subscription.nii || 0,
            snii: backendData.subscription.snii || 0,
            bnii: backendData.subscription.bnii || 0,
            retail: backendData.subscription.retail || 0,
            employee: backendData.subscription.employee || 0,
            total: backendData.subscription.total || 0
        } : undefined,
        gmpDetails: backendData.gmp ? backendData.gmp.map((g: any) => ({
            price: g.price || 0,
            date: moment(g.date).format('DD MMM'),
            kostak: g.kostak || '-'
        })) : [],
        maxPrice: backendData.max_price || backendData.lot_price || 0
    };
};
