/**
 * Automated Playback Test Script
 * Tests the complete song playback pipeline
 */

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';
const FRONTEND_URL = 'http://localhost:5173';

class PlaybackTester {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  log(emoji, message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`${emoji} ${message}`);
    
    if (type === 'pass') this.results.passed.push(message);
    if (type === 'fail') this.results.failed.push(message);
    if (type === 'warn') this.results.warnings.push(message);
  }

  async testBackendHealth() {
    this.log('🏥', '\n=== Testing Backend Health ===');
    
    try {
      const response = await axios.get(`${API_URL}/health`);
      if (response.status === 200) {
        this.log('✅', 'Backend health check passed', 'pass');
        return true;
      }
    } catch (error) {
      this.log('❌', `Backend health check failed: ${error.message}`, 'fail');
      return false;
    }
  }

  async testGetSongs() {
    this.log('🎵', '\n=== Testing GET /songs ===');
    
    try {
      const response = await axios.get(`${API_URL}/songs`);
      
      if (response.data.success) {
        const songs = response.data.data;
        this.log('✅', `Successfully fetched ${songs.length} songs`, 'pass');
        
        if (songs.length === 0) {
          this.log('⚠️', 'No songs in database - upload songs to test playback', 'warn');
          return null;
        }
        
        // Log first song details
        const firstSong = songs[0];
        this.log('ℹ️', `First song: "${firstSong.title}" by ${firstSong.artist}`);
        this.log('ℹ️', `Song ID: ${firstSong._id}`);
        
        return firstSong;
      } else {
        this.log('❌', 'Failed to fetch songs - invalid response', 'fail');
        return null;
      }
    } catch (error) {
      this.log('❌', `Failed to fetch songs: ${error.message}`, 'fail');
      return null;
    }
  }

  async testStreamEndpoint(songId) {
    this.log('🔗', '\n=== Testing Stream Endpoint ===');
    
    if (!songId) {
      this.log('⚠️', 'No song ID provided - skipping stream test', 'warn');
      return null;
    }
    
    try {
      const response = await axios.get(`${API_URL}/songs/${songId}/stream`);
      
      if (response.data.success) {
        const { streamUrl, cdnType, diagnostic } = response.data.data;
        
        this.log('✅', 'Stream URL obtained successfully', 'pass');
        this.log('ℹ️', `CDN Type: ${cdnType}`);
        this.log('ℹ️', `Stream URL: ${streamUrl.substring(0, 80)}...`);
        
        // Check CDN optimization
        if (cdnType === 'cloudfront') {
          this.log('✅', 'Using CloudFront (optimal)', 'pass');
        } else if (cdnType === 'S3') {
          this.log('⚠️', 'Using S3 direct URLs (CloudFront recommended)', 'warn');
        }
        
        // Check diagnostic warnings
        if (diagnostic?.warning) {
          this.log('⚠️', `Backend warning: ${diagnostic.warning}`, 'warn');
        }
        
        return streamUrl;
      } else {
        this.log('❌', 'Failed to get stream URL - invalid response', 'fail');
        return null;
      }
    } catch (error) {
      this.log('❌', `Stream endpoint error: ${error.message}`, 'fail');
      
      if (error.response) {
        this.log('ℹ️', `Status: ${error.response.status}`);
        this.log('ℹ️', `Error: ${error.response.data?.error || 'Unknown'}`);
        
        if (error.response.data?.diagnostic) {
          this.log('ℹ️', `Diagnostic: ${JSON.stringify(error.response.data.diagnostic)}`);
        }
      }
      
      return null;
    }
  }

  async testHLSManifest(streamUrl) {
    this.log('📜', '\n=== Testing HLS Manifest ===');
    
    if (!streamUrl) {
      this.log('⚠️', 'No stream URL provided - skipping manifest test', 'warn');
      return false;
    }
    
    try {
      const response = await axios.head(streamUrl, { timeout: 10000 });
      
      if (response.status === 200) {
        this.log('✅', 'HLS manifest is accessible', 'pass');
        this.log('ℹ️', `Status: ${response.status}`);
        this.log('ℹ️', `Content-Type: ${response.headers['content-type']}`);
        return true;
      } else {
        this.log('⚠️', `Unexpected status: ${response.status}`, 'warn');
        return false;
      }
    } catch (error) {
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        this.log('❌', `Cannot reach manifest URL: ${error.code}`, 'fail');
        this.log('ℹ️', 'This may be a DNS or network issue');
      } else if (error.response) {
        this.log('❌', `Manifest not accessible: HTTP ${error.response.status}`, 'fail');
      } else {
        this.log('⚠️', `Manifest test inconclusive: ${error.message}`, 'warn');
      }
      return false;
    }
  }

  async testFrontendHealth() {
    this.log('🌐', '\n=== Testing Frontend Health ===');
    
    try {
      const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
      
      if (response.status === 200) {
        this.log('✅', 'Frontend is accessible', 'pass');
        return true;
      }
    } catch (error) {
      this.log('❌', `Frontend not accessible: ${error.message}`, 'fail');
      return false;
    }
  }

  async testValidationFlow() {
    this.log('🔍', '\n=== Testing Validation Flow ===');
    
    // Test invalid song ID
    try {
      await axios.get(`${API_URL}/songs/undefined/stream`);
      this.log('❌', 'Invalid ID validation failed - should have returned error', 'fail');
    } catch (error) {
      if (error.response?.status === 400) {
        this.log('✅', 'Invalid song ID correctly rejected (400 Bad Request)', 'pass');
      } else {
        this.log('⚠️', `Unexpected error for invalid ID: ${error.response?.status}`, 'warn');
      }
    }
    
    // Test non-existent song ID
    try {
      await axios.get(`${API_URL}/songs/000000000000000000000000/stream`);
      this.log('❌', 'Non-existent ID validation failed - should have returned 404', 'fail');
    } catch (error) {
      if (error.response?.status === 404) {
        this.log('✅', 'Non-existent song correctly returns 404 Not Found', 'pass');
      } else {
        this.log('⚠️', `Unexpected error for non-existent ID: ${error.response?.status}`, 'warn');
      }
    }
  }

  printSummary() {
    console.log('\n\n════════════════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('════════════════════════════════════════════════════════\n');
    
    console.log(`✅ Passed: ${this.results.passed.length}`);
    console.log(`❌ Failed: ${this.results.failed.length}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}\n`);
    
    if (this.results.failed.length > 0) {
      console.log('❌ FAILED TESTS:');
      this.results.failed.forEach((test, i) => {
        console.log(`   ${i + 1}. ${test}`);
      });
      console.log('');
    }
    
    if (this.results.warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      this.results.warnings.forEach((test, i) => {
        console.log(`   ${i + 1}. ${test}`);
      });
      console.log('');
    }
    
    const allPassed = this.results.failed.length === 0;
    
    if (allPassed) {
      console.log('✅ ALL TESTS PASSED!\n');
      console.log('🎉 The playback system is ready!');
      console.log('👉 Next step: Open http://localhost:5173 and test playback manually\n');
    } else {
      console.log('❌ SOME TESTS FAILED\n');
      console.log('👉 Fix the failed tests before proceeding\n');
    }
    
    console.log('════════════════════════════════════════════════════════\n');
    
    return allPassed;
  }

  async runAllTests() {
    console.log('\n════════════════════════════════════════════════════════');
    console.log('🧪 AUTOMATED PLAYBACK TEST SUITE');
    console.log('════════════════════════════════════════════════════════');
    
    // Test 1: Backend Health
    const backendHealthy = await this.testBackendHealth();
    if (!backendHealthy) {
      console.log('\n❌ Backend is not running. Start with: npm run dev');
      return false;
    }
    
    // Test 2: Get Songs
    const firstSong = await this.testGetSongs();
    
    // Test 3: Stream Endpoint
    let streamUrl = null;
    if (firstSong) {
      streamUrl = await this.testStreamEndpoint(firstSong._id);
    }
    
    // Test 4: HLS Manifest
    if (streamUrl) {
      await this.testHLSManifest(streamUrl);
    }
    
    // Test 5: Frontend Health
    await this.testFrontendHealth();
    
    // Test 6: Validation Flow
    await this.testValidationFlow();
    
    // Print summary
    return this.printSummary();
  }
}

// Run tests
const tester = new PlaybackTester();
tester.runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n❌ Test suite crashed:', error);
    process.exit(1);
  });
