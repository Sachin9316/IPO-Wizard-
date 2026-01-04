export interface IPOData {
    _id?: string;
    id: string; // Used for frontend keying
    name: string;
    type: 'Mainboard' | 'SME';
    priceRange: string;
    openDate: string;
    closeDate: string;
    status: 'Open' | 'Closed' | 'Upcoming';
    logoUrl?: string; // Cloudinary URL
    gmp: string; // Formatted string, e.g., "₹50 (10%)"
    subscription: string; // e.g., "50x"
    lotSize: string;
    issueSize: string;
    dates: {
        offerStart: string;
        offerEnd: string;
        allotment: string;
        refund: string;
        listing: string;
    };
    rawDates?: {
        offerStart: string;
        offerEnd: string;
        allotment: string;
        refund: string;
        listing: string;
    };
    isAllotmentOut?: boolean;
    rhpUrl?: string;
    drhpUrl?: string;
    registrarLink?: string;
    swot?: {
        strengths: string[];
        weaknesses: string[];
        opportunities: string[];
        threats: string[];
    };
    subscriptionDetails?: {
        qib: number;
        nii: number;
        snii?: number;
        bnii?: number;
        retail: number;
        employee: number;
        total: number;
    };
    gmpDetails?: {
        price: number;
        date: string;
        kostak: string;
    }[];
    maxPrice?: number;
}
