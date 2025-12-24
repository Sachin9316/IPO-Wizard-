import { IPOData } from '../data/dummyData';
import moment from 'moment';

export const mapBackendToFrontend = (backendData: any): IPOData => {
    const isSME = backendData.ipoType === 'SME';

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
        // Calculate percentage if lot_price is available
        let percentage = 0;
        if (backendData.lot_price) {
            percentage = (price / backendData.lot_price) * 100;
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
        issueSize: '0 Cr', // Backend might need to provide this, or calculate
        dates: {
            offerStart: moment(backendData.open_date).format('DD MMM'),
            offerEnd: moment(backendData.close_date).format('DD MMM'),
            allotment: moment(backendData.allotment_date).format('DD MMM'),
            refund: moment(backendData.refund_date).format('DD MMM'),
            listing: moment(backendData.listing_date).format('DD MMM')
        },
        isAllotmentOut: backendData.isAllotmentOut || false
    };
};
