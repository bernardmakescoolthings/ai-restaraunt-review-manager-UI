'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

interface Profile {
  id: string;
  name: string;
  personality: string;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newProfile, setNewProfile] = useState<Omit<Profile, 'id'>>({
    name: '',
    personality: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const savedProfiles = localStorage.getItem('aiProfiles');
      if (savedProfiles) {
        setProfiles(JSON.parse(savedProfiles));
      }
    } catch (err) {
      console.error('Error loading profiles:', err);
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newProfile.name.trim() || !newProfile.personality.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const profile: Profile = {
      ...newProfile,
      id: uuidv4()
    };

    const updatedProfiles = [...profiles, profile];
    setProfiles(updatedProfiles);
    localStorage.setItem('aiProfiles', JSON.stringify(updatedProfiles));
    
    // Reset form
    setNewProfile({
      name: '',
      personality: ''
    });
  };

  const handleDelete = (id: string) => {
    const updatedProfiles = profiles.filter(profile => profile.id !== id);
    setProfiles(updatedProfiles);
    localStorage.setItem('aiProfiles', JSON.stringify(updatedProfiles));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Response Profiles</h1>
        <Link 
          href="/"
          className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Back to Reviews
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Name
              </label>
              <input
                type="text"
                id="name"
                value={newProfile.name}
                onChange={(e) => setNewProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
                placeholder="e.g., Professional, Friendly, Formal"
              />
            </div>
            <div>
              <label htmlFor="personality" className="block text-sm font-medium text-gray-700 mb-1">
                Personality
              </label>
              <textarea
                id="personality"
                value={newProfile.personality}
                onChange={(e) => setNewProfile(prev => ({ ...prev, personality: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                rows={4}
                required
                placeholder="Describe the personality and tone for AI responses..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Create Profile
            </button>
          </form>
        </div>

        {/* Profiles List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Saved Profiles</h2>
          <div className="space-y-4">
            {profiles.length === 0 ? (
              <p className="text-gray-500">No profiles created yet.</p>
            ) : (
              profiles.map(profile => (
                <div key={profile.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{profile.name}</h3>
                      <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{profile.personality}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(profile.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 