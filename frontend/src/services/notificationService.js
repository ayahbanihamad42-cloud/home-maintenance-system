export const getNotifications = user_id => axios.get(`/notifications/user/${user_id}`);
export const sendNotification = data => axios.post('/notifications',data);
