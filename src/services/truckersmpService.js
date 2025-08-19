import axios from 'axios';


export const getVTCAttendingEvents = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/events/attending`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TNL VTC Event Tracker'
      }
    });
    
    // The API returns data in a specific structure, let's log it to see what we get
    
    
    // Return the events array from the response
    return response.data.response || [];
  } catch (error) {
    console.error('Error fetching VTC attending events:', error);
    throw error;
  }
}; 