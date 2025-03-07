// UserProfileFacade.js
//acts as a simplified and unified interface for fetching user data, abstracting away the complexities and 
//details of the underlying implementation. 
//aligns with the principles of the facade design pattern
import axios from 'axios';

export default class UserProfileFacade {
    async fetchUserData(username) {
        try {
            const response = await axios.get(`/userData/${username}`);

            if (response.data.success) {
                return response.data.user;
            } else {
                console.error('User data fetch failed:', response.data.message);
                return null;
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }
}