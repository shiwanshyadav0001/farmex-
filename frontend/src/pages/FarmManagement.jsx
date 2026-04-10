import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/lib/api';
import { useTranslation } from '@/i18n';
import { Tractor, Plus, Loader, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import LiveFeatureScene from '@/components/motion/LiveFeatureScene';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  }, [map]);
  return null;
}

function FarmManagement() {
  const { t, translateOption } = useTranslation();
  const [farms, setFarms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapPosition, setMapPosition] = useState([20.5937, 78.9629]); // India center default
  const [formData, setFormData] = useState({
    user_name: '',
    location: '',
    soil_type: 'Loamy',
    total_area: '',
    current_crops: '',
  });

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const profile = JSON.parse(localStorage.getItem('farmex-profile') || '{}');
      const response = await axios.get(`${API}/farms`, { params: { user_email: profile.email } });
      setFarms(response.data.farms);
    } catch (err) {
      console.error('Failed to fetch farms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const profile = JSON.parse(localStorage.getItem('farmex-profile') || '{}');
      const payload = {
        ...formData,
        user_email: profile.email,
        latitude: mapPosition ? mapPosition[0] : null,
        longitude: mapPosition ? mapPosition[1] : null,
        total_area: parseFloat(formData.total_area),
        current_crops: formData.current_crops.split(',').map((item) => item.trim()).filter(Boolean),
      };

      await axios.post(`${API}/farm/create`, payload);
      setShowForm(false);
      setFormData({
        user_name: '',
        location: '',
        soil_type: 'Loamy',
        total_area: '',
        current_crops: '',
      });
      fetchFarms();
    } catch (err) {
      setError(t('Failed to create farm. Please try again.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const soilTypes = ['Sandy', 'Loamy', 'Clay', 'Silt', 'Peaty', 'Chalky'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#061613] via-[#0a221d] to-[#10322b] p-6 text-white" data-testid="farm-management-page">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 fade-in">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <LiveFeatureScene type="farm" farms={farms} showForm={showForm} />
            </div>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2" data-testid="add-farm-btn">
              <Plus className="h-5 w-5" />
              {t('Add New Farm')}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="card mb-8 fade-in" data-testid="farm-form">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">{t('Create New Farm')}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{t('Farm Owner Name')}</label>
                  <input type="text" value={formData.user_name} onChange={(event) => setFormData({ ...formData, user_name: event.target.value })} placeholder={t('Enter owner name')} className="input-field" required data-testid="farm-owner-input" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{t('Location')}</label>
                  <input type="text" value={formData.location} onChange={(event) => setFormData({ ...formData, location: event.target.value })} placeholder={t('Enter location')} className="input-field" required data-testid="farm-location-input" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{t('Soil Type')}</label>
                  <select value={formData.soil_type} onChange={(event) => setFormData({ ...formData, soil_type: event.target.value })} className="select-field" data-testid="farm-soil-type-select">
                    {soilTypes.map((item) => (
                      <option key={item} value={item}>{translateOption(item)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{t('Total Area (acres)')}</label>
                  <input type="number" step="0.1" value={formData.total_area} onChange={(event) => setFormData({ ...formData, total_area: event.target.value })} placeholder="0.0" className="input-field" required data-testid="farm-area-input" />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{t('Pinpoint Farm Location (Click to adjust)')}</label>
                <div className="h-[250px] w-full rounded-lg overflow-hidden border border-gray-300 dark:border-slate-600">
                  <MapContainer center={mapPosition} zoom={4} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                    <MapResizer />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationPicker position={mapPosition} setPosition={setMapPosition} />
                  </MapContainer>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{t('Current Crops (comma-separated)')}</label>
                <input type="text" value={formData.current_crops} onChange={(event) => setFormData({ ...formData, current_crops: event.target.value })} placeholder={t('e.g., Rice, Wheat, Corn')} className="input-field" data-testid="farm-crops-input" />
              </div>

              {error && <p className="text-sm text-red-600" data-testid="farm-error">{error}</p>}

              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2" data-testid="create-farm-btn">
                  {loading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      {t('Creating...')}
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      {t('Create Farm')}
                    </>
                  )}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border-2 border-gray-300 dark:border-slate-600 px-6 py-3 font-medium transition-all hover:bg-gray-100">
                  {t('Cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="fade-in" data-testid="farms-list">
          <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">{t('Your Farms')}</h2>
          {loading && !showForm ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="h-12 w-12 animate-spin text-teal-600" />
            </div>
          ) : farms.length === 0 ? (
            <div className="card py-16 text-center">
              <Tractor className="mx-auto mb-4 h-24 w-24 text-gray-400" />
              <p className="text-lg text-gray-500">{t('No farms yet. Create your first farm to get started!')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {farms.map((farm) => (
                <div key={farm.id} className="card hover-lift" data-testid={`farm-card-${farm.id}`}>
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-green-500">
                      <Tractor className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-gray-100">{farm.user_name}</h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-teal-600" />
                      <span>{farm.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('Soil Type:')}</span>
                      <span className="font-medium text-gray-800 dark:text-gray-100">{translateOption(farm.soil_type)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('Area:')}</span>
                      <span className="font-medium text-gray-800 dark:text-gray-100">{farm.total_area} {t('acres')}</span>
                    </div>
                    {farm.current_crops && farm.current_crops.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-slate-700 pt-2">
                        <span className="text-xs text-gray-500">{t('Current Crops:')}</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {farm.current_crops.map((crop, idx) => (
                            <span key={idx} className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 dark:text-green-400">
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FarmManagement;
