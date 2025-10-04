import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    if (address) {
      // Geocoding: Convert address to coordinates
      console.log('Geocoding API - Converting address to coordinates:', address);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=th&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch geocoding data');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return NextResponse.json({
          success: true,
          coordinates: {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon)
          },
          address: result.display_name,
          addressDetails: result.address
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Address not found'
        }, { status: 404 });
      }
    } else if (lat && lng) {
      // Reverse geocoding: Convert coordinates to address
      console.log('Geocoding API - Converting coordinates to address:', lat, lng);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch reverse geocoding data');
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        return NextResponse.json({
          success: true,
          coordinates: {
            lat: parseFloat(lat),
            lng: parseFloat(lng)
          },
          address: data.display_name,
          addressDetails: data.address
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Address not found for coordinates'
        }, { status: 404 });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'Either address or coordinates (lat, lng) must be provided'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Geocoding API - Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process geocoding request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
