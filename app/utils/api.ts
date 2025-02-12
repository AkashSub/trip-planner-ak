const API_BASE = 'http://localhost:5000/api';

export const api = {
  async getTrips(username: string) {
    const response = await fetch(`${API_BASE}/trips?username=${encodeURIComponent(username)}`);
    return await response.json();
  },

  async getVarkalaTrip() {  
    const response = await fetch(`${API_BASE}/trip`);
    return await response.json();
  },

  async createTrip(tripData: any) {
    const response = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(tripData)
    });
    return await response.json();
  },

  async updateTrip(tripId: string, tripData: any, username: string) {
    if (!username || username === "undefined") {
      throw new Error('Username is required for update');
    }
    
    const response = await fetch(`${API_BASE}/trips/${tripId}?username=${encodeURIComponent(username)}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(tripData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update trip');
    }
    
    return await response.json();
  },

  async deleteTrip(tripId: string) {
    const response = await fetch(`${API_BASE}/trips/${tripId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete trip');
    }
    
    return await response.json();
  },

  async getTripExpenses() {  // Remove tripId parameter
    const response = await fetch(`${API_BASE}/trips/expenses`);
    if (!response.ok) throw new Error('Failed to fetch expenses');
    return await response.json();
  },

  settleExpense: async (expense: { description: string; paidBy: string; amount: number }) => {
    const response = await fetch(`${API_BASE}/trips/expenses/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    });
    
    if (!response.ok) {
      throw new Error('Failed to settle expense');
    }
    
    return response.json();
  },

  deleteExpense: async (expense: { description: string; paidBy: string; amount: number }) => {
    const response = await fetch(`${API_BASE}/trips/expenses/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete expense');
    }
    
    return response.json();
  },

  async createTripExpense(expenseData: any) {  // Remove tripId parameter
    const response = await fetch(`${API_BASE}/trips/expenses`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(expenseData)
    });
    if (!response.ok) throw new Error('Failed to create expense');
    return await response.json();
  },

  async getItinerary() {
    const response = await fetch(`${API_BASE}/itinerary`);
    if (!response.ok) throw new Error('Failed to fetch itinerary');
    return await response.json();
  },

  async updateItinerary(data: any) {
    const response = await fetch(`${API_BASE}/itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update itinerary');
    return await response.json();
  },

  // async updateActivity(activityId: string, activityData: any) {
  //   const response = await fetch(`${API_BASE}/itinerary/activity/`, {
  //     method: 'PUT',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(activityData)
  //   });
  //   if (!response.ok) throw new Error('Failed to update activity');
  //   return await response.json();
  // },


  async updateItineraryActivity(activityId: string, updatedData: Partial<Activity>) {
    if (!activityId) {
      throw new Error('Activity ID is required');
    }
  
    try {
      const response = await fetch(`${API_BASE}/itinerary/activity/${activityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedData,
          id: activityId  // Explicitly include ID
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(errorText || 'Failed to update activity');
      }
  
      return response.json();
    } catch (error) {
      console.error('Update activity error:', error);
      throw error;
    }
  },

  async addActivity(activity: Activity) {
    const response = await fetch(`${API_BASE}/itinerary/addactivity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });
    if (!response.ok) throw new Error('Failed to add activity');
    return await response.json();
  }
};