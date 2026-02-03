const API_BASE = '/api';

class ApiService{

    /* Fetch all api calls */

    async request( endpoint , options = {}){
        const config = {
            Headers : {
                'Content-Type' : 'application/json',
                ...options.Headers
            },

            Credentials: ' include', // Include cookies for sessions
            ...options
        };

        try{
            const response = await fetch(`${API_BASE}${endpoint}`,config);
            const data = await response.json();

            if( !response.ok){
                throw new Error( data.error || data.message || 'Request failed.');
            }

            return data;

        }catch( error ){
            console.error('API Error:',error);
            throw error;
        }
    }

    /* AUTH ENDPOINTS */

    async register( email , password ){
        return this.request('/auth/register',{
            method : 'POST',
            body : JSON.stringify({ email , password })
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        });
    }

    async checkAuthStatus() {
        return this.request('/auth/status');
    }

    /* ATTRACTION ENDPOINTS */

    async getAttractions() {
        return this.request('/attractions');
    }

    async getAttraction(id) {
        return this.request(`/attractions/${id}`);
    }

    /* QUEUE ENDPOINTS */

    async getQueueStatus(attractionId) {
        return this.request(`/queue/${attractionId}`);
    }

    async getAllQueues() {
        return this.request('/queue');
    }

    async updateQueueStatus(attractionId, queue_length, estimated_wait_minutes) {
        return this.request(`/queue/${attractionId}`, {
            method: 'PATCH',
            body: JSON.stringify({ queue_length, estimated_wait_minutes })
        });
    }

    /* NOTIFICATION ENDPOINTS */

    async subscribeNotifications() {
        return this.request('/notifications/subscribe', {
            method: 'POST'
        });
    }

    async unsubscribeNotifications() {
        return this.request('/notifications/unsubscribe', {
            method: 'POST'
        });
    }

    async getNotifications(limit = 20) {
        return this.request(`/notifications?limit=${limit}`);
    }

    async markNotificationAsRead(id) {
        return this.request(`/notifications/${id}/read`, {
            method: 'PATCH'
        });
    }

    /* NAVIGATION ENDOINTS */
    async calculateETA(user_latitude, user_longitude, attraction_id) {
        return this.request('/navigation/eta', {
            method: 'POST',
            body: JSON.stringify({
                user_latitude,
                user_longitude,
                attraction_id
            })
        });
    }

    /* PROFILE ENDPOINTS */

    async getProfile() {
        return this.request('/profile');
    }

    async updatePreferences(preferences) {
        return this.request('/profile/preferences', {
            method: 'PATCH',
            body: JSON.stringify(preferences)
        });
    }

    /* STAFF METRICS ENDPOINTS */

    async getStaffMetrics( from_date , to_date , attraction_id ){
        let url = '/staff-metrics';
        const params = new URLSearchParams();
        if( from_date ) params.append( 'from_date', from_date );
        if( to_date ) params.append( 'to_date', to_date );
        if( attraction_id ) params.append( 'attraction_id' , attraction_id );
        if( params.toString()) url += `?${params.toString()}`;
        return this.request(url);
    }

    async getMetricsSummary( from_date , to_date ){
        let url = '/staff-metrics/summary';
        const params = new URLSearchParams();
        if( from_date ) params.append( 'from_date', from_date );
        if( to_date ) params.append( 'to_date', to_date );
        if( params.toString()) url += `?${params.toString()}`;
        return this.request(url);
    }

    async recordMetrics( attraction_id , metric_date , ticket_sales , uptime_percentage , visitors_count , avg_wait_time_minutes ){
        return this.request('/staff-metrics',{
            method : 'POST',
            body : JSON.stringify({
                attraction_id,
                metric_date,
                ticket_sales,
                uptime_percentage,
                visitors_count,
                avg_wait_time_minutes
            })
        });
    }
}

export default new ApiService();