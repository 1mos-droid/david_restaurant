import axios from 'axios';
import type { MenuItem } from '../types/index';

const API_URL = '/api';

export const fetchMenuItems = async (category?: string): Promise<MenuItem[]> => {
    try {
        const response = await axios.get(`${API_URL}/menu`, {
            params: { category }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching menu:', error);
        return [];
    }
};

export const submitOrder = async (orderData: any) => {
    try {
        const response = await axios.post(`${API_URL}/orders`, orderData);
        return response.data;
    } catch (error) {
        console.error('Error submitting order:', error);
        throw error;
    }
};
