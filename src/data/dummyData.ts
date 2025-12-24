export interface IPOData {
    id: string;
    name: string;
    type: 'Mainboard' | 'SME';
    priceRange: string;
    openDate: string;
    closeDate: string;
    status: 'Open' | 'Closed' | 'Upcoming';
    logoUrl?: string;
    gmp: string; // Grey Market Premium
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
    isAllotmentOut?: boolean;
}

const generateIPO = (id: string, name: string, type: 'Mainboard' | 'SME', status: 'Open' | 'Closed' | 'Upcoming'): IPOData => {
    return {
        id,
        name,
        type,
        priceRange: type === 'SME' ? '₹120 - ₹125' : '₹450 - ₹500',
        openDate: '2025-01-10',
        closeDate: '2025-01-12',
        status,
        gmp: `₹${Math.floor(Math.random() * 100)} (${Math.floor(Math.random() * 50)}%)`,
        subscription: `${(Math.random() * 100).toFixed(2)}x`,
        lotSize: type === 'SME' ? '1000' : '30',
        issueSize: type === 'SME' ? '50 Cr' : '1200 Cr',
        dates: {
            offerStart: '10 Jan',
            offerEnd: '12 Jan',
            allotment: '15 Jan',
            refund: '16 Jan',
            listing: '18 Jan'
        }
    };
};

export const DUMMY_IPOS: IPOData[] = [
    // Mainboard - Open
    generateIPO('1', 'Zomato Limited', 'Mainboard', 'Open'),
    generateIPO('2', 'LIC India', 'Mainboard', 'Open'),
    generateIPO('3', 'Ola Electric', 'Mainboard', 'Open'),
    generateIPO('4', 'Swiggy', 'Mainboard', 'Open'),
    generateIPO('5', 'Mamaearth', 'Mainboard', 'Open'),

    // Mainboard - Upcoming
    generateIPO('6', 'Hyundai India', 'Mainboard', 'Upcoming'),
    generateIPO('7', 'PhonePe', 'Mainboard', 'Upcoming'),
    generateIPO('8', 'Flipkart', 'Mainboard', 'Upcoming'),
    generateIPO('9', 'Oyo Rooms', 'Mainboard', 'Upcoming'),
    generateIPO('10', 'GoDigit Insurance', 'Mainboard', 'Upcoming'),

    // Mainboard - Closed
    generateIPO('11', 'Tata Technologies', 'Mainboard', 'Closed'),
    generateIPO('12', 'JSW Infra', 'Mainboard', 'Closed'),
    generateIPO('13', 'Mankind Pharma', 'Mainboard', 'Closed'),
    generateIPO('14', 'RR Kabel', 'Mainboard', 'Closed'),
    generateIPO('15', 'Cello World', 'Mainboard', 'Closed'),
    generateIPO('16', 'Honasa Consumer', 'Mainboard', 'Closed'),
    generateIPO('17', 'Blue Jet Healthcare', 'Mainboard', 'Closed'),
    generateIPO('18', 'Protean eGov', 'Mainboard', 'Closed'),
    generateIPO('19', 'Ask Automotive', 'Mainboard', 'Closed'),
    generateIPO('20', 'ESAF Bank', 'Mainboard', 'Closed'),

    // SME - Open
    generateIPO('21', 'TechSME Solutions', 'SME', 'Open'),
    generateIPO('22', 'AgroSME Ind', 'SME', 'Open'),
    generateIPO('23', 'SolarSME Power', 'SME', 'Open'),
    generateIPO('24', 'GreenSME Energy', 'SME', 'Open'),
    generateIPO('25', 'BuildSME Infra', 'SME', 'Open'),

    // SME - Upcoming
    generateIPO('26', 'FutureSME Tech', 'SME', 'Upcoming'),
    generateIPO('27', 'SmartSME Devices', 'SME', 'Upcoming'),
    generateIPO('28', 'EcoSME Products', 'SME', 'Upcoming'),
    generateIPO('29', 'RapidSME Logistics', 'SME', 'Upcoming'),
    generateIPO('30', 'PrimeSME Foods', 'SME', 'Upcoming'),

    // SME - Closed
    generateIPO('31', 'Basilic Fly', 'SME', 'Closed'),
    generateIPO('32', 'Pramara Promo', 'SME', 'Closed'),
    generateIPO('33', 'Saroja Pharma', 'SME', 'Closed'),
    generateIPO('34', 'Shoora Designs', 'SME', 'Closed'),
    generateIPO('35', 'Bondada Eng', 'SME', 'Closed'),
    generateIPO('36', 'Shelter Pharma', 'SME', 'Closed'),
    generateIPO('37', 'Yasons Chemex', 'SME', 'Closed'),
    generateIPO('38', 'Global Pet', 'SME', 'Closed'),
    generateIPO('39', 'Tridhya Tech', 'SME', 'Closed'),
    generateIPO('40', 'Magson Retail', 'SME', 'Closed'),

    // More Mainboard
    generateIPO('41', 'Urban Company', 'Mainboard', 'Upcoming'),
    generateIPO('42', 'Lenskart', 'Mainboard', 'Upcoming'),
    generateIPO('43', 'Cred', 'Mainboard', 'Upcoming'),
    generateIPO('44', 'Groww', 'Mainboard', 'Upcoming'),
    generateIPO('45', 'Zerodha', 'Mainboard', 'Upcoming'),

    // More SME
    generateIPO('46', 'AlphaSME', 'SME', 'Open'),
    generateIPO('47', 'BetaSME', 'SME', 'Closed'),
    generateIPO('48', 'GammaSME', 'SME', 'Upcoming'),
    generateIPO('49', 'DeltaSME', 'SME', 'Open'),
    generateIPO('50', 'OmegaSME', 'SME', 'Closed'),
];

export const ALLOTED_IPOS: IPOData[] = [
    DUMMY_IPOS[10], // Tata Tech
    DUMMY_IPOS[30], // Basilic Fly
];
