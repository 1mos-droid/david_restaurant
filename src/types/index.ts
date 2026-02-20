export const TYPES_VERSION = '1.0.0';

export interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    category: 'starters' | 'mains' | 'desserts' | 'drinks';
    image: string;
    badge?: string | null;
}

export interface CartItem extends MenuItem {
    quantity: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        instructions?: string;
    };
    items: CartItem[];
    totals: {
        subtotal: number;
        tax: number;
        deliveryFee?: number;
        total: number;
    };
    status: 'pending' | 'preparing' | 'delivered' | 'cancelled';
    createdAt: string;
}

export interface Reservation {
    id: string;
    reservationId: string;
    details: {
        adults: number;
        date: string;
        time: string;
        occasion?: string;
    };
    contact: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt: string;
}

export interface CustomerDashboardData {
    user: {
        firstName: string;
        lastName: string;
        email: string;
        membershipTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
        nextPerk?: string;
        pointsToNext?: number;
        avatar?: string;
    };
    stats: {
        totalOrders: number;
        activeOrdersCount?: number;
        totalReservations: number;
        loyaltyPoints: number;
        totalSpent: number;
    };
    activeOrders?: Order[];
    pastOrders?: Order[];
    orders: Order[];
    reservations: Reservation[];
    recentActivity: {
        type: string;
        message: string;
        date: string;
    }[];
}
