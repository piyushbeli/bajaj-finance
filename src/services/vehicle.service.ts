import type { VehicleFormData, ApiResponse, VehicleListResponse } from '../types/vehicle.types';

/**
 * Base API URL used by all vehicle service functions.
 *
 * We always use a relative base path `/api/v1/bajaj`:
 * - In local development, Vite is configured (in `vite.config.ts`) to proxy
 *   `/api` requests to the backend ALB, so a browser
 *   call to `http://localhost:3000/api/v1/bajaj/...` is transparently forwarded
 *   to the backend API.
 * - In production on Vercel, `vercel.json` defines a rewrite from
 *   `/api/v1/bajaj/...` to the backend ALB, so the
 *   browser always talks to the HTTPS frontend origin and Vercel does the HTTP
 *   call to the backend, avoiding mixed‑content errors.
 */
const API_BASE_URL: string = '/api/v1/bajaj';
/**
 * Helper function to log API calls for debugging
 */
const logApiCall = (method: string, url: string, data?: unknown): void => {
  console.log(`[API Call] ${method} ${url}`, data ? { data } : '');
};

/**
 * Service function to add a vehicle via API
 * @param formData - Vehicle form data to submit
 * @returns Promise with API response
 */
export const addVehicle = async (formData: VehicleFormData): Promise<ApiResponse> => {
  const url = `${API_BASE_URL}/add-vehicle`;
  logApiCall('POST', url, formData);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.error || errorData.message || 'Failed to add vehicle');
    }

    const data = await response.json();
    console.log('[API Success] POST add-vehicle', data);
    return {
      success: true,
      message: data.message || 'Vehicle added successfully',
    };
  } catch (error) {
    // Handle network errors or parsing errors
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('[API Error] POST add-vehicle', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Service function to get all vehicles with optional filters
 * @param serialNumber - Optional serial number filter
 * @param dealerCode - Optional dealer code filter
 * @returns Promise with vehicle list response
 */
export const getVehicles = async (
  serialNumber?: string,
  dealerCode?: string,
): Promise<VehicleListResponse> => {
  const params = new URLSearchParams();
  if (serialNumber) {
    params.append('serial_number', serialNumber);
  }
  if (dealerCode) {
    params.append('dealer_code', dealerCode);
  }

  const url = `${API_BASE_URL}/vehicles${params.toString() ? `?${params.toString()}` : ''}`;
  logApiCall('GET', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.error || errorData.message || 'Failed to fetch vehicles');
    }

    const data = await response.json();
    console.log('[API Success] GET vehicles', data);
    
    // Handle different response structures
    // When fetching all: { success: true, message: '...', data: Array, page: 1, page_size: 10 }
    // When searching: { success: true, message: '...', data: {...} } (single object)
    if (Array.isArray(data)) {
      return { vehicles: data };
    }
    if (data.data) {
      // Handle both array (list) and object (single vehicle search)
      if (Array.isArray(data.data)) {
        return { vehicles: data.data };
      } else {
        // Single vehicle object from search - convert to array
        return { vehicles: [data.data] };
      }
    }
    if (data.vehicles && Array.isArray(data.vehicles)) {
      return { vehicles: data.vehicles };
    }
    
    // Fallback to empty array if structure is unexpected
    console.warn('[API Warning] Unexpected response structure:', data);
    return { vehicles: [] };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('[API Error] GET vehicles', errorMessage);
    return {
      vehicles: [],
      error: errorMessage,
    };
  }
};

/**
 * Service function to get a single vehicle by ID
 * @param vehicleId - Vehicle ID
 * @returns Promise with vehicle response
 */
export const getVehicleById = async (vehicleId: number): Promise<VehicleListResponse> => {
  const url = `${API_BASE_URL}/vehicles/${vehicleId}`;
  logApiCall('GET', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.error || errorData.message || 'Failed to fetch vehicle');
    }

    const data = await response.json();
    console.log('[API Success] GET vehicle by id', data);
    
    // Handle different response structures
    // API might return: { success: true, message: '...', data: {...} }
    const vehicle = data.data || data.vehicle || data;
    return {
      vehicle: vehicle,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('[API Error] GET vehicle by id', errorMessage);
    return {
      error: errorMessage,
    };
  }
};

/**
 * Service function to update a vehicle
 * @param vehicleId - Vehicle ID to update
 * @param formData - Updated vehicle form data
 * @returns Promise with API response
 */
export const updateVehicle = async (
  vehicleId: number,
  formData: VehicleFormData,
): Promise<ApiResponse> => {
  const url = `${API_BASE_URL}/update-vehicle/${vehicleId}`;
  logApiCall('PATCH', url, formData);

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.error || errorData.message || 'Failed to update vehicle');
    }

    const data = await response.json();
    console.log('[API Success] PATCH update-vehicle', data);
    return {
      success: true,
      message: data.message || 'Vehicle updated successfully',
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('[API Error] PATCH update-vehicle', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Service function to delete a vehicle
 * @param vehicleId - Vehicle ID to delete
 * @returns Promise with API response
 */
export const deleteVehicle = async (vehicleId: number): Promise<ApiResponse> => {
  const url = `${API_BASE_URL}/delete-vehicle/${vehicleId}`;
  logApiCall('DELETE', url);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.error || errorData.message || 'Failed to delete vehicle');
    }

    const data = await response.json();
    console.log('[API Success] DELETE vehicle', data);
    return {
      success: true,
      message: data.message || 'Vehicle deleted successfully',
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('[API Error] DELETE vehicle', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Service function to mark a vehicle as sold
 * @param vehicleId - Vehicle ID to mark as sold
 * @returns Promise with API response
 */
export const markAsSold = async (vehicleId: number): Promise<ApiResponse> => {
  const url = `${API_BASE_URL}/update-vehicle/${vehicleId}`;
  
  // API expects only status field with value "sold"
  const payload = {
    status: 'sold',
  };
  
  logApiCall('PATCH', url, payload);

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.error || errorData.message || 'Failed to mark vehicle as sold');
    }

    const data = await response.json();
    console.log('[API Success] PATCH mark as sold', data);
    return {
      success: true,
      message: data.message || 'Vehicle marked as sold successfully',
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('[API Error] PATCH mark as sold', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
};
