import { useState } from 'react';
import { motion } from 'framer-motion';
import { songs, genres } from '@/data/mockData';
import SongCard from '@/components/common/SongCard';
import SongList from '@/components/common/SongList';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const filteredSongs = songs.filter(song => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGenre = selectedGenre === 'All' || song.genre === selectedGenre;
    
    return matchesSearch && matchesGenre;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Search Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
          <span className="text-4xl">🔍</span>
          <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">Search</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-medium">Find your favorite songs, artists, and albums</p>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative group"
      >
        <input
          type="text"
          placeholder="Search for songs, artists, or albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-6 py-4 pl-14 rounded-2xl glass-strong border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-orange/50 focus:ring-2 focus:ring-accent-orange/20 transition-all duration-300 hover:border-accent-orange/30"
        />
        <svg
          className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-accent-orange transition-colors duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </motion.div>

      {/* Genre Filter */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-3"
      >
        <button
          onClick={() => setSelectedGenre('All')}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            selectedGenre === 'All'
              ? 'bg-gradient-to-r from-accent-orange to-accent-red text-white shadow-lg shadow-accent-orange/30'
              : 'bg-dark-lighter/50 text-gray-400 hover:text-white hover:bg-dark-lighter'
          }`}
        >
          All Genres
        </button>
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              selectedGenre === genre
                ? 'bg-gradient-to-r from-accent-orange to-accent-red text-white shadow-lg shadow-accent-orange/30'
                : 'bg-dark-lighter/50 text-gray-400 hover:text-white hover:bg-dark-lighter'
            }`}
          >
            {genre}
          </button>
        ))}
      </motion.div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400">
          {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'} found
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-accent-orange text-white'
                : 'bg-dark-lighter/50 text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-accent-orange text-white'
                : 'bg-dark-lighter/50 text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Results */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {filteredSongs.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredSongs.map(song => (
                <SongCard key={song._id || song.id} song={song} playlist={filteredSongs} />
              ))}
            </div>
          ) : (
            <div className="bg-dark-lighter/30 backdrop-blur-sm rounded-xl p-4 border border-white/5">
              <SongList songs={filteredSongs} showIndex={true} />
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No songs found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Search;
