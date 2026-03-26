import { useState, useRef } from 'react';
import { Upload as UploadIcon, X, CheckCircle, AlertCircle, Music, Image as ImageIcon } from 'lucide-react';
import axios from '@/utils/axios';
import GlassCard from '@/components/admin/GlassCard';

const BulkUpload = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [formData, setFormData] = useState({
    artist: '',
    album: '',
    genre: 'Pop',
    language: 'English',
    mood: '',
    bpm: '',
  });

  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const genres = ['Pop', 'Rock', 'Electronic', 'Hip Hop', 'R&B', 'Jazz', 'Classical', 'Country'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Other'];

  const handleAudioSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('audio/'));
    
    if (validFiles.length > 500) {
      alert('You can only select up to 500 files at a time.');
      validFiles.splice(500);
    }
    
    setAudioFiles(validFiles);
    setProgress({ current: 0, total: validFiles.length, success: 0, failed: 0 });
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setCoverFile(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  const removeCoverFile = () => {
    setCoverFile(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const removeAudioFiles = () => {
    setAudioFiles([]);
    setProgress({ current: 0, total: 0, success: 0, failed: 0 });
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (audioFiles.length === 0) {
      alert('Please select at least one audio file');
      return;
    }

    if (!formData.artist || !formData.genre || !formData.language) {
      alert('Please fill in global required fields (Artist, Genre, Language)');
      return;
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i];
      setProgress(prev => ({ ...prev, current: i + 1 }));
      
      const title = file.name.replace(/\.[^/.]+$/, ""); // Strip extension

      const formDataToSend = new FormData();
      formDataToSend.append('audio', file);
      if (coverFile) {
        formDataToSend.append('cover', coverFile);
      }
      formDataToSend.append('title', title);
      formDataToSend.append('artist', formData.artist);
      formDataToSend.append('album', formData.album);
      formDataToSend.append('genre', formData.genre);
      formDataToSend.append('language', formData.language);
      if (formData.mood) formDataToSend.append('mood', formData.mood);
      if (formData.bpm) formDataToSend.append('bpm', formData.bpm);

      try {
        await axios.post('/api/v1/upload/song-with-cover', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        successCount++;
        setProgress(prev => ({ ...prev, success: successCount }));
      } catch (error) {
        console.error(`Failed to upload ${title}:`, error);
        failCount++;
        setProgress(prev => ({ ...prev, failed: failCount }));
      }
    }

    setUploading(false);
    alert(`Bulk Upload Complete!\nSuccessful: ${successCount}\nFailed: ${failCount}`);
    
    // Clear list if completely successful
    if (failCount === 0) {
      removeAudioFiles();
      removeCoverFile();
      setFormData({ artist: '', album: '', genre: 'Pop', language: 'English', mood: '', bpm: '' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Bulk Audio Selection</h2>
        <p className="text-sm text-gray-400 mb-6">Select up to 500 audio files at once. The track title will automatically be assigned from the file name.</p>
        
        <label
          htmlFor="bulk-audio-upload"
          className={`relative block border-2 border-dashed ${audioFiles.length > 0 ? 'border-accent-orange' : 'border-white/20'} rounded-2xl p-12 text-center hover:border-accent-orange/50 transition-colors cursor-pointer group`}
        >
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-accent-orange to-accent-red rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-lg font-medium text-white mb-2">
                {audioFiles.length > 0 ? `${audioFiles.length} files selected` : 'Drop multiple audio files here'}
              </p>
              <p className="text-sm text-gray-400">or click to browse</p>
            </div>
          </div>
          <input
            id="bulk-audio-upload"
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleAudioSelect}
            className="hidden"
          />
        </label>

        {audioFiles.length > 0 && (
          <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
             <div>
               <p className="text-white font-medium">{audioFiles.length} tracks queued for upload</p>
               <p className="text-xs text-gray-400 mt-1">First track ex: {audioFiles[0].name}</p>
             </div>
             <button onClick={removeAudioFiles} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        )}

        {/* Progress Display */}
        {uploading && (
          <div className="mt-6 p-6 bg-dark-lighter rounded-xl border border-white/10">
            <h3 className="text-white font-medium mb-4">Upload Progress</h3>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Processing {progress.current} of {progress.total}</span>
              <span className="text-white font-bold">{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 mb-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-accent-orange to-accent-red h-3 rounded-full transition-all duration-300" 
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div className="flex items-center text-green-400"><CheckCircle className="w-4 h-4 mr-2" /> Successful: {progress.success}</div>
              <div className="flex items-center text-red-400"><AlertCircle className="w-4 h-4 mr-2" /> Failed: {progress.failed}</div>
            </div>
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Global Metadata</h2>
        <p className="text-sm text-gray-400 mb-6">These details will be applied to ALL {audioFiles.length > 0 ? audioFiles.length : 'selected'} tracks in the batch.</p>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Global Artist *</label>
            <input
              type="text"
              required
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors"
              placeholder="Enter artist name for all tracks"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Global Album</label>
            <input
              type="text"
              value={formData.album}
              onChange={(e) => setFormData({ ...formData, album: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors"
              placeholder="e.g. Greatest Hits"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Genre *</label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-orange/50 transition-colors appearance-none cursor-pointer"
              >
                {genres.map(g => <option key={g} value={g} className="bg-dark-lighter">{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Language *</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-orange/50 transition-colors appearance-none cursor-pointer"
              >
                {languages.map(l => <option key={l} value={l} className="bg-dark-lighter">{l}</option>)}
              </select>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Global Cover Image</label>
            <label htmlFor="bulk-cover-upload" className="relative block border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-accent-orange/50 transition-colors cursor-pointer">
              {coverFile ? (
                <div className="flex items-center justify-center space-x-2">
                  <ImageIcon className="w-6 h-6 text-accent-orange" />
                  <div>
                    <p className="text-sm text-white">{coverFile.name}</p>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); removeCoverFile(); }}
                      className="text-xs text-gray-400 hover:text-white mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Upload common cover image (optional)</p>
                </>
              )}
              <input
                id="bulk-cover-upload"
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverSelect}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || audioFiles.length === 0}
            className="w-full py-3 bg-gradient-to-r from-accent-orange to-accent-red text-white rounded-xl hover:shadow-lg hover:shadow-accent-orange/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium mt-6"
          >
            {uploading ? 'Processing Bulk Upload...' : `Start Upload (${audioFiles.length} files)`}
          </button>
        </form>
      </GlassCard>
    </div>
  );
};

export default BulkUpload;
