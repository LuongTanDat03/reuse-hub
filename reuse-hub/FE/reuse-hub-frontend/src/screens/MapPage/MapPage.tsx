import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNearbyItems, formatPrice } from '../../api/item';
import { ItemSummaryResponse } from '../../types/api';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MapPin, Eye, Heart } from 'lucide-react';

type LatLng = { lat: number; lng: number };

const DEFAULT_CENTER: LatLng = { lat: 10.8231, lng: 106.6297 }; // TP.HCM

export const MapPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [center, setCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [query, setQuery] = useState<string>('');
  const [items, setItems] = useState<ItemSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(5000); // 5km default

  const mapSrc = useMemo(() => {
    const q = query.trim() ? encodeURIComponent(query.trim()) : `${center.lat},${center.lng}`;
    return `https://www.google.com/maps?q=${q}&z=14&output=embed`;
  }, [center, query]);

  useEffect(() => {
    if (!navigator.geolocation) {
      loadNearbyItems();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCenter({ lat: latitude, lng: longitude });
        // Load items after getting location
        setTimeout(() => loadNearbyItems(latitude, longitude), 500);
      },
      () => {
        // keep default center if user denies, still load items
        loadNearbyItems();
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  const loadNearbyItems = async (lat?: number, lng?: number) => {
    setLoading(true);
    try {
      const latitude = lat || center.lat;
      const longitude = lng || center.lng;
      const response = await getNearbyItems(latitude, longitude, radius, 0, 20);
      setItems(response.data.content);
    } catch (error) {
      console.error("Error loading nearby items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // This would ideally geocode the query, but for now just reload items
    loadNearbyItems();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Bản đồ - Tìm kiếm gần đây</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4">
        <div className="mb-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex gap-2">
            <input
              className="flex-1 rounded-md border px-3 py-2"
              placeholder="Tìm địa điểm, ví dụ: Quận 1, TP.HCM"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Tìm
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Bán kính:</label>
            <select
              value={radius}
              onChange={(e) => {
                setRadius(Number(e.target.value));
                loadNearbyItems();
              }}
              className="rounded-md border px-3 py-2 text-sm"
            >
              <option value="1000">1 km</option>
              <option value="3000">3 km</option>
              <option value="5000">5 km</option>
              <option value="10000">10 km</option>
              <option value="20000">20 km</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="lg:col-span-2">
            <div ref={mapRef} className="w-full h-[70vh] rounded-lg overflow-hidden border">
              <iframe
                title="map"
                src={mapSrc}
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>Vị trí hiện tại: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}</p>
              <p>Tìm thấy {items.length} sản phẩm trong bán kính {radius / 1000}km</p>
            </div>
          </div>

          {/* Items List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-4">
              <h2 className="font-semibold text-lg mb-4">Sản phẩm gần đây</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
              ) : items.length > 0 ? (
                <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                  {items.map((item) => (
                    <Link key={item.id} to={`/product/${item.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <img
                              src={item.images[0] || "/placeholder-image.png"}
                              alt={item.title}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                                {item.title}
                              </h3>
                              <p className="text-red-500 font-bold text-sm mb-1">
                                {formatPrice(item.price)}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <MapPin size={12} />
                                <span className="truncate">Gần đây</span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Eye size={12} />
                                  {item.viewCount}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart size={12} />
                                  {item.likeCount}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Không tìm thấy sản phẩm nào trong bán kính này</p>
                  <Button
                    onClick={() => loadNearbyItems()}
                    variant="outline"
                    className="mt-4"
                  >
                    Tải lại
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MapPage;



