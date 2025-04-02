'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Profile } from '@/types/review';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [newProfile, setNewProfile] = useState({ profile_name: '', profile_text_addon: '' });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const response = await fetch('/api/profiles');
      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }
      const data = await response.json();
      setProfiles(data);
      localStorage.setItem('profiles', JSON.stringify(data));
    } catch (error) {
      console.error('Error loading profiles:', error);
      setError('Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfile.profile_name.trim()) {
      setError('Profile name cannot be empty');
      return;
    }

    try {
      const response = await fetch('/api/profiles/add_profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_name: newProfile.profile_name,
          profile_text_base: newProfile.profile_text_addon,
          profile_text_addon: newProfile.profile_text_addon,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create profile');
      }

      setNewProfile({ profile_name: '', profile_text_addon: '' });
      await loadProfiles();
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('Failed to create profile');
    }
  };

  const handleUpdateProfile = async () => {
    if (!editingProfile) {
      setError('No profile selected for editing');
      return;
    }

    if (!editingProfile.profile_name.trim()) {
      setError('Profile name cannot be empty');
      return;
    }

    try {
      const response = await fetch(`/api/profiles/${editingProfile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_name: editingProfile.profile_name,
          profile_text_addon: editingProfile.profile_text_addon,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setEditingProfile(null);
      await loadProfiles();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const handleDeleteProfile = async (id: number) => {
    if (!confirm('Are you sure you want to delete this profile?')) {
      return;
    }

    try {
      const response = await fetch(`/api/profiles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete profile');
      }

      await loadProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      setError('Failed to delete profile');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Response Profiles</h1>
          <Link
            href="/reviews"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Back to Reviews
          </Link>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-blue-900 mb-2">About Response Profiles</h2>
          <p className="text-blue-700 mb-4">
            By default the AI will respond in a few sentences respectfully and professionally. Please add any other modifiers you would wish for it to keep in mind when replying.
          </p>
          <div className="bg-white rounded-md p-4 border border-blue-100">
            <p className="text-blue-800 font-medium mb-2">Examples:</p>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>The restaurant you are working for is called Restaurant Name</li>
              <li>Please invite them to reach out to example@example.com</li>
            </ul>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Response Profiles</h3>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Create New Profile
              </button>
            </div>
          </div>

          {isCreating && (
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="profile_name" className="block text-sm font-medium text-gray-700">
                    Profile Name
                  </label>
                  <input
                    type="text"
                    id="profile_name"
                    value={newProfile.profile_name}
                    onChange={(e) => setNewProfile({ ...newProfile, profile_name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="profile_text_addon" className="block text-sm font-medium text-gray-700">
                    Profile Text
                  </label>
                  <textarea
                    id="profile_text_addon"
                    value={newProfile.profile_text_addon}
                    onChange={(e) => setNewProfile({ ...newProfile, profile_text_addon: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateProfile}
                    disabled={!newProfile.profile_name.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {profiles.map((profile) => (
                <li key={profile.id} className="px-4 py-5 sm:px-6">
                  {editingProfile?.id === profile.id ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor={`profile_name_${profile.id}`} className="block text-sm font-medium text-gray-700">
                          Profile Name
                        </label>
                        <input
                          type="text"
                          id={`profile_name_${profile.id}`}
                          value={editingProfile.profile_name}
                          onChange={(e) => setEditingProfile({ ...editingProfile, profile_name: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor={`profile_text_addon_${profile.id}`} className="block text-sm font-medium text-gray-700">
                          Profile Text
                        </label>
                        <textarea
                          id={`profile_text_addon_${profile.id}`}
                          value={editingProfile.profile_text_addon}
                          onChange={(e) => setEditingProfile({ ...editingProfile, profile_text_addon: e.target.value })}
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setEditingProfile(null)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateProfile}
                          disabled={!editingProfile.profile_name.trim()}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h4 className="text-lg font-medium text-gray-900">{profile.profile_name}</h4>
                        {profile.profile_text_addon && (
                          <div className="text-sm text-gray-500">
                            <p className="font-medium">Profile Text:</p>
                            <p className="mt-1">{profile.profile_text_addon}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setEditingProfile(profile)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProfile(profile.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 