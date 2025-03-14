import React, { useState, useEffect } from 'react';
import { MapPin, Plus, X, Edit, Save, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../../../core/api/supabase';

interface Location {
  id: string;
  location: string;
  created_at: string;
}

export const LocationManager = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [newLocation, setNewLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingLocation, setEditingLocation] = useState({ index: -1, value: '' });
  
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('locations')
        .select('id, location, created_at')
        .order('location');
      
      if (error) throw error;
      
      setLocations(data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
      setError('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddLocation = async () => {
    if (!newLocation.trim()) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      setSaving(true);
      setError('');
      
      const { data, error } = await supabase
        .from('locations')
        .insert([{ 
          location: newLocation.trim()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setLocations([...locations, data]);
      setNewLocation('');
      setSuccess('Location added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to add location');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setLocations(locations.filter(loc => loc.id !== id));
      setSuccess('Location deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete location');
    }
  };

  const handleUpdateLocation = async (id: string, newLocationName: string) => {
    if (!newLocationName.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('locations')
        .update({ location: newLocationName.trim() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setLocations(locations.map(loc => loc.id === id ? data : loc));
      setEditingLocation({ index: -1, value: '' });
      setSuccess('Location updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update location');
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-600">Loading locations...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">Locations</h3>
        <p className="text-sm text-gray-500">Manage your locations to track where expenses occur. Add, edit, or remove locations to better organize your spending.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle size={16} className="mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
          <Check size={16} className="mr-2" />
          {success}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          placeholder="Add new location"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          disabled={saving}
        />
        <button
          onClick={handleAddLocation}
          disabled={saving || !newLocation.trim()}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
        >
          <Plus size={18} />
        </button>
      </div>

      <ul className="space-y-2">
        {locations.map((location, index) => (
          <li key={location.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            {editingLocation.index === index ? (
              <input
                type="text"
                value={editingLocation.value}
                onChange={(e) => setEditingLocation({ ...editingLocation, value: e.target.value })}
                className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                autoFocus
              />
            ) : (
              <span className="flex items-center text-gray-700">
                <MapPin size={16} className="mr-2 text-gray-500" />
                {location.location}
              </span>
            )}
            
            <div className="flex items-center space-x-2">
              {editingLocation.index === index ? (
                <>
                  <button
                    onClick={() => handleUpdateLocation(location.id, editingLocation.value)}
                    disabled={saving || !editingLocation.value.trim()}
                    className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={() => setEditingLocation({ index: -1, value: '' })}
                    disabled={saving}
                    className="p-1 text-gray-600 hover:text-gray-700 disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditingLocation({ index, value: location.location })}
                    disabled={saving}
                    className="p-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(location.id)}
                    disabled={saving}
                    className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};