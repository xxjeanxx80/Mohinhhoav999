import { Injectable, Logger } from '@nestjs/common';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);

  /**
   * Geocode an address to get latitude and longitude
   * Uses OpenStreetMap Nominatim (free, no API key needed)
   * Rate limit: 1 request per second
   */
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!address || address.trim().length === 0) {
      return null;
    }

    try {
      return await this.geocodeWithNominatim(address);
    } catch (error) {
      this.logger.error(`Error geocoding address "${address}":`, error);
      return null;
    }
  }

  /**
   * Geocode using OpenStreetMap Nominatim (free, no API key needed)
   * Rate limit: 1 request per second
   */
  /**
   * Normalize address for better geocoding results
   * Removes common prefixes that confuse Nominatim
   */
  private normalizeAddress(address: string): string[] {
    const variations: string[] = [address];
    
    // Remove common prefixes that might confuse geocoding
    let normalized = address.trim();
    
    // Remove "Số" prefix (Number prefix)
    if (normalized.toLowerCase().startsWith('số ')) {
      normalized = normalized.substring(4).trim();
      variations.push(normalized);
    }
    
    // Remove "Phố" if it's standalone and causing issues
    // Keep it if it's part of street name like "Phố Mai Hắc Đế"
    const withoutPhố = normalized.replace(/^phố\s+/i, '').trim();
    if (withoutPhố !== normalized && withoutPhố.length > 0) {
      variations.push(withoutPhố);
    }
    
    // Try without commas
    const withoutCommas = normalized.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    if (withoutCommas !== normalized) {
      variations.push(withoutCommas);
    }
    
    return [...new Set(variations)]; // Remove duplicates
  }

  private async geocodeWithNominatim(address: string): Promise<GeocodeResult | null> {
    try {
      // Normalize address and try multiple variations
      const addressVariations = this.normalizeAddress(address);
      
      this.logger.log(`🔍 Geocoding address: "${address}" -> Trying ${addressVariations.length} variations`);

      // Try each variation
      for (let i = 0; i < addressVariations.length; i++) {
        const searchAddress = addressVariations[i];
        const addressWithVietnam = searchAddress.includes('Vietnam') || searchAddress.includes('Việt Nam') || searchAddress.includes('Hà Nội') || searchAddress.includes('Ho Chi Minh')
          ? searchAddress
          : `${searchAddress}, Vietnam`;

        // Try with Vietnam restrictions first (more accurate)
        const urlWithRestrictions = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressWithVietnam)}&limit=1&addressdetails=1&countrycodes=vn&bounded=1&viewbox=102.1,23.4,109.5,8.6`;

        await this.delay(1100);

        this.logger.log(`  🔍 Try ${i + 1}/${addressVariations.length}: "${searchAddress}" (with restrictions)`);

        let response = await fetch(urlWithRestrictions, {
          headers: {
            'User-Agent': 'BeautyBookingHub/1.0',
            'Accept-Language': 'vi,en',
          },
        });

        if (!response.ok) {
          throw new Error(`Nominatim API error: ${response.statusText}`);
        }

        let data = await response.json();

        // If no results with restrictions, try without restrictions (broader search)
        if (!data || data.length === 0) {
          this.logger.log(`  ⚠️ No results with restrictions, trying broader search...`);
          
          await this.delay(1100);
          
          const urlWithoutRestrictions = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressWithVietnam)}&limit=5&addressdetails=1`;

          response = await fetch(urlWithoutRestrictions, {
            headers: {
              'User-Agent': 'BeautyBookingHub/1.0',
              'Accept-Language': 'vi,en',
            },
          });

          if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.statusText}`);
          }

          data = await response.json();

          // Filter results to prefer Vietnam locations
          if (data && data.length > 0) {
            const vietnamResult = data.find((item: any) => 
              item.address?.country === 'Việt Nam' || 
              item.address?.country === 'Vietnam' ||
              item.display_name?.includes('Việt Nam') ||
              item.display_name?.includes('Vietnam')
            );

            if (vietnamResult) {
              data = [vietnamResult];
              this.logger.log(`  ✅ Found Vietnam result in broader search`);
            } else {
              // Use first result if no Vietnam-specific result found
              data = [data[0]];
              this.logger.warn(`  ⚠️ Using first result (may not be in Vietnam)`);
            }
          }
        }

        // If we found results, use them
        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);

          if (isNaN(lat) || isNaN(lng)) {
            this.logger.warn(`  ⚠️ Invalid coordinates from Nominatim: lat=${result.lat}, lng=${result.lon}`);
            continue; // Try next variation
          }

          this.logger.log(`✅ Successfully geocoded (variation ${i + 1}): "${address}" -> (${lat}, ${lng})`);
          this.logger.log(`📍 Formatted address: "${result.display_name}"`);
          this.logger.log(`📍 Address details: ${JSON.stringify(result.address || {})}`);

          return {
            latitude: lat,
            longitude: lng,
            formattedAddress: result.display_name || address,
          };
        }
      }

      // If all variations failed
      this.logger.warn(`⚠️ No results found for address after trying ${addressVariations.length} variations: "${address}"`);
      return null;
    } catch (error) {
      this.logger.error(`❌ Nominatim geocoding failed for "${address}":`, error);
      return null;
    }
  }

  /**
   * Reverse geocode: convert lat/lng to address
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      return await this.reverseGeocodeWithNominatim(latitude, longitude);
    } catch (error) {
      this.logger.error(`Error reverse geocoding (${latitude}, ${longitude}):`, error);
      return null;
    }
  }

  private async reverseGeocodeWithNominatim(latitude: number, longitude: number): Promise<string | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;

      await this.delay(1100);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'BeautyBookingHub/1.0',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      this.logger.error('Reverse geocoding failed:', error);
      return null;
    }
  }


  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

