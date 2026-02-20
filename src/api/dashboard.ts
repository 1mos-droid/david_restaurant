import axios from 'axios';
import type { CustomerDashboardData } from '../types/index';

const API_URL = '/api';

export const fetchDashboardData = async (email: string): Promise<CustomerDashboardData> => {
    try {
        const response = await axios.get(`${API_URL}/customer/dashboard`, {
            params: { email }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
};
