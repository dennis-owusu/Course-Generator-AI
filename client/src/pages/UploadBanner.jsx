import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import Header from '@/components/ui/Header';
import Loader from '@/components/Loader';
import { useToast } from '@/hooks/use-toast';

const UploadBanner = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courseTitle, setCourseTitle] = useState('');

  useEffect(() => {
    // Fetch course details to display the title
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/content/course/${courseId}`);
        setCourseTitle(response.data.title);
      } catch (err) { 
        console.error('Error fetching course details:', err);
        setError('Failed to load course details.');
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(''); // Clear previous errors
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image file first.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('bannerImage', selectedFile);

    try {
      await axios.post(`http://localhost:3000/api/content/course/${courseId}/banner`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast({
        title: "Success!",
        description: "Banner image uploaded successfully.",
      });
      // Optionally navigate away after successful upload
      navigate(`/course/${courseId}`); // Navigate to the course detail page
    } catch (err) {
      console.error('Error uploading banner image:', err);
      setError('Failed to upload banner image. Please try again.');
      toast({
        title: "Error!",
        description: "Failed to upload banner image.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h2 className="text-3xl font-semibold mb-4 text-center text-[#4338ca]">
          Upload Banner for "{courseTitle || 'Course'}"
        </h2>
        
        {loading && <Loader />}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="mb-4">
            <label htmlFor="bannerUpload" className="block text-sm font-medium text-gray-700 mb-2">
              Choose Banner Image
            </label>
            <input 
              id="bannerUpload"
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e0e7ff] file:text-[#4338ca] hover:file:bg-[#c7d2fe] cursor-pointer"
            />
          </div>

          {preview && (
            <div className="mb-4 border rounded-lg overflow-hidden">
              <p className="text-sm font-medium text-gray-700 mb-2 px-3 pt-2">Image Preview:</p>
              <img src={preview} alt="Banner Preview" className="w-full h-auto object-cover" />
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')} // Option to skip
              disabled={loading}
            >
              Skip for Now
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || loading}
              className='bg-[#4338ca] hover:bg-[#818cf8]'
            >
              {loading ? 'Uploading...' : 'Upload Banner'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadBanner;