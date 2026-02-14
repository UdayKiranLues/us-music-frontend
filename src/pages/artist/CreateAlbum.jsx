import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/utils/axios';
import { Upload, Disc, Check, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const CreateAlbum = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [coverPreview, setCoverPreview] = useState(null);
    const [mySongs, setMySongs] = useState([]);
    const [loadingSongs, setLoadingSongs] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        genre: '',
        description: '',
        coverImage: null,
        selectedSongs: [],
    });

    const genres = [
        'Pop', 'Rock', 'Hip Hop', 'R&B', 'Jazz', 'Classical', 'Electronic', 'Country', 'Folk', 'Reggae', 'Blues', 'Other'
    ];

    useEffect(() => {
        const fetchMySongs = async () => {
            try {
                const response = await api.get('/api/v1/artist/songs');
                setMySongs(response.data.data || []);
            } catch (err) {
                console.error('❌ Failed to fetch songs:', err);
                showToast('Failed to load your songs', '❌');
            } finally {
                setLoadingSongs(false);
            }
        };
        fetchMySongs();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const { files } = e.target;
        const file = files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setCoverPreview(event.target?.result);
            };
            reader.readAsDataURL(file);
            setFormData(prev => ({ ...prev, coverImage: file }));
        }
    };

    const toggleSongSelection = (songId) => {
        setFormData(prev => ({
            ...prev,
            selectedSongs: prev.selectedSongs.includes(songId)
                ? prev.selectedSongs.filter(id => id !== songId)
                : [...prev.selectedSongs, songId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }
        if (!formData.coverImage) {
            setError('Cover image is required');
            return;
        }
        if (formData.selectedSongs.length === 0) {
            setError('Please select at least one song for the album');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 1. Upload cover image first to get URL
            const imageFormData = new FormData();
            imageFormData.append('image', formData.coverImage);

            const uploadRes = await api.post('/api/v1/upload/cover', imageFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const coverImageUrl = uploadRes.data.url;

            // 2. Create the album
            const albumData = {
                title: formData.title,
                genre: formData.genre,
                description: formData.description,
                coverImageUrl,
                songs: formData.selectedSongs
            };

            await api.post('/api/v1/albums', albumData);

            showToast('Album created successfully!', '✅');
            navigate('/artist/dashboard');
        } catch (err) {
            console.error('❌ Failed to create album:', err);
            setError(err.response?.data?.error || 'Failed to create album. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-8"
        >
            {/* Header */}
            <motion.section
                variants={itemVariants}
                className="relative overflow-hidden rounded-3xl p-8 md:p-12 glass-strong border border-white/10"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 via-accent-purple/20 to-dark/20 opacity-60" />
                <div className="relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-5xl font-bold text-white mb-4"
                    >
                        Create <span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">Album</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-300 text-lg"
                    >
                        Group your songs into a professional collection
                    </motion.p>
                </div>
            </motion.section>

            {/* Form Section */}
            <motion.section
                variants={itemVariants}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
            >
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left: Cover Image */}
                        <div className="md:col-span-1 space-y-4">
                            <label className="block text-sm font-medium text-white">Album Cover</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative aspect-square rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-accent-blue/50 transition-all overflow-hidden group"
                            >
                                {coverPreview ? (
                                    <>
                                        <img src={coverPreview} alt="Album cover preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Upload className="w-8 h-8 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Disc className="w-12 h-12 text-gray-500 mb-2" />
                                        <p className="text-xs text-gray-500 text-center px-4 font-medium">Click to upload cover</p>
                                    </>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <p className="text-xs text-gray-500 text-center italic">Square image recommended (Max 5MB)</p>
                        </div>

                        {/* Right: Album Info */}
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Album Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter album name"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Primary Genre</label>
                                <select
                                    name="genre"
                                    value={formData.genre}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all [&>option]:bg-dark"
                                >
                                    <option value="">Select genre</option>
                                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Write something about your album..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent resize-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">🎵</span>
                            Select Songs
                            <span className="text-sm font-normal text-gray-400 ml-2">({formData.selectedSongs.length} selected)</span>
                        </h3>

                        {loadingSongs ? (
                            <div className="py-12 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue" />
                            </div>
                        ) : mySongs.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                {mySongs.map(song => {
                                    const isSelected = formData.selectedSongs.includes(song._id);
                                    return (
                                        <div
                                            key={song._id}
                                            onClick={() => toggleSongSelection(song._id)}
                                            className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                                ? 'bg-accent-blue/10 border-accent-blue/50'
                                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                                }`}
                                        >
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={api.defaults.baseURL + (song.coverImageUrl?.startsWith('/') ? '' : '/') + song.coverImageUrl}
                                                    alt={song.title}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Song'; }}
                                                />
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-accent-blue/40 flex items-center justify-center rounded-lg">
                                                        <Check className="w-6 h-6 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold text-sm truncate ${isSelected ? 'text-accent-blue' : 'text-white'}`}>
                                                    {song.title}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{song.genre || 'Unknown Genre'}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-gray-400 mb-4">You haven't uploaded any songs yet.</p>
                                <button
                                    type="button"
                                    onClick={() => navigate('/artist/songs/new')}
                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                                >
                                    Upload a song first
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                            <X className="text-red-500 flex-shrink-0" />
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="flex justify-end pt-6 border-t border-white/10 gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/artist/dashboard')}
                            className="px-8 py-3 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-bold rounded-xl hover:shadow-lg hover:shadow-accent-blue/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Album...' : 'Create Album'}
                        </button>
                    </div>
                </form>
            </motion.section>
        </motion.div>
    );
};

export default CreateAlbum;
