import React, { useState, useRef, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Image } from 'lucide-react';

interface FaviconSettingsProps {}

const FaviconSettings: React.FC<FaviconSettingsProps> = () => {
  console.log('FaviconSettings component rendering');
  
  const { currentUser, updateUser } = useUserStore();
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 500 * 1024; // 500KB
  const ALLOWED_TYPES = ['image/png', 'image/x-icon', 'image/jpeg', 'image/svg+xml'];
  const FILE_EXTENSIONS = ['.png', '.ico', '.jpg', '.svg'];

  useEffect(() => {
    console.log('FaviconSettings mounted, currentUser:', currentUser);
    if (currentUser?.preferences.favicon) {
      setPreviewUrl(currentUser.preferences.favicon);
    }
  }, [currentUser]);

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Invalid file format. Please upload a ${FILE_EXTENSIONS.join(', ')} file.`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 500KB. Please upload a smaller file.');
      return false;
    }

    return true;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File change event triggered');
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const updateFavicon = (url: string) => {
    console.log('Updating favicon with URL:', url);
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = url;
  };

  const handleSave = async () => {
    if (!fileInputRef.current?.files?.[0] || !currentUser) {
      console.log('No file selected or no currentUser');
      return;
    }

    setIsUploading(true);
    setError('');
    
    try {
      console.log('Starting file upload');
      const file = fileInputRef.current.files[0];
      const storageRef = ref(storage, `favicons/${currentUser.id}/${file.name}`);

      // Delete old favicon if exists
      if (currentUser.preferences.favicon) {
        try {
          const oldFaviconRef = ref(storage, currentUser.preferences.favicon);
          await deleteObject(oldFaviconRef);
        } catch (error) {
          console.error('Error deleting old favicon:', error);
        }
      }

      // Upload new favicon
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      console.log('File uploaded successfully, URL:', downloadUrl);

      // Update user preferences
      await updateUser(currentUser.id, {
        preferences: {
          ...currentUser.preferences,
          favicon: downloadUrl,
        },
      });

      // Update favicon in document
      updateFavicon(downloadUrl);

      setSuccess('Favicon updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error in handleSave:', error);
      setError('An error occurred while updating the favicon. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = async () => {
    if (!currentUser) {
      console.log('No currentUser available for reset');
      return;
    }

    try {
      console.log('Starting favicon reset');
      // Delete current favicon from storage if it exists
      if (currentUser.preferences.favicon) {
        const oldFaviconRef = ref(storage, currentUser.preferences.favicon);
        await deleteObject(oldFaviconRef);
      }

      // Reset to default favicon
      const defaultFavicon = '/favicon.ico';
      updateFavicon(defaultFavicon);

      // Update user preferences
      await updateUser(currentUser.id, {
        preferences: {
          ...currentUser.preferences,
          favicon: '',
        },
      });

      setPreviewUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSuccess('Reset to default favicon successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error in handleReset:', error);
      setError('An error occurred while resetting the favicon. Please try again.');
    }
  };

  if (!currentUser) {
    console.log('FaviconSettings: No currentUser, returning null');
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Image className="w-5 h-5" />
        <h3 className="text-lg font-medium text-gray-900">Favicon Settings</h3>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <div className="space-y-4">
        {previewUrl && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Current Favicon:</span>
            <img
              src={previewUrl}
              alt="Favicon Preview"
              className="w-8 h-8 border border-gray-200 rounded"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload New Favicon
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={ALLOWED_TYPES.join(',')}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            Supported formats: {FILE_EXTENSIONS.join(', ')}. Max size: 500KB
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={isUploading || !fileInputRef.current?.files?.[0]}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Save Changes'}
          </button>
          
          <button
            onClick={handleReset}
            className="text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaviconSettings;
