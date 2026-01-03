const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class WhisperService {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY;
        this.baseURL = 'https://api.openai.com/v1/audio/transcriptions';
        
        if (!this.apiKey) {
            console.warn('⚠️ OPENAI_API_KEY not found - Whisper transcription will be disabled');
        }
    }

    /**
     * Transcribe audio file using OpenAI Whisper API
     * @param {string} audioFilePath - Path to the audio file
     * @param {Object} options - Transcription options
     * @returns {Promise<Object>} Transcription result
     */
    async transcribeAudio(audioFilePath, options = {}) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.');
        }

        try {
            // Check if file exists
            if (!fs.existsSync(audioFilePath)) {
                throw new Error('Audio file not found');
            }

            // Create form data
            const formData = new FormData();
            formData.append('file', fs.createReadStream(audioFilePath));
            formData.append('model', options.model || 'whisper-1');
            
            // Optional parameters
            if (options.language) {
                formData.append('language', options.language);
            }
            
            if (options.prompt) {
                formData.append('prompt', options.prompt);
            }
            
            if (options.response_format) {
                formData.append('response_format', options.response_format);
            } else {
                formData.append('response_format', 'verbose_json');
            }
            
            if (options.temperature !== undefined) {
                formData.append('temperature', options.temperature.toString());
            }

            // Make API request
            const response = await axios.post(this.baseURL, formData, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    ...formData.getHeaders()
                },
                timeout: 30000 // 30 second timeout
            });

            // Process response
            const result = response.data;
            
            return {
                success: true,
                text: result.text,
                language: result.language,
                duration: result.duration,
                segments: result.segments || [],
                confidence: this.calculateAverageConfidence(result.segments || []),
                words: result.words || [],
                metadata: {
                    model: options.model || 'whisper-1',
                    processing_time: result.duration,
                    file_size: fs.statSync(audioFilePath).size
                }
            };

        } catch (error) {
            console.error('Whisper transcription error:', error);
            
            if (error.response) {
                // API error
                const apiError = error.response.data;
                throw new Error(`Whisper API error: ${apiError.error?.message || 'Unknown error'}`);
            } else if (error.code === 'ENOENT') {
                throw new Error('Audio file not found');
            } else if (error.code === 'ECONNABORTED') {
                throw new Error('Transcription timeout - file may be too large');
            } else {
                throw new Error(`Transcription failed: ${error.message}`);
            }
        }
    }

    /**
     * Transcribe audio buffer (for real-time transcription)
     * @param {Buffer} audioBuffer - Audio data buffer
     * @param {string} filename - Filename for the audio
     * @param {Object} options - Transcription options
     * @returns {Promise<Object>} Transcription result
     */
    async transcribeBuffer(audioBuffer, filename, options = {}) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured');
        }

        try {
            // Create form data with buffer
            const formData = new FormData();
            formData.append('file', audioBuffer, {
                filename: filename,
                contentType: 'audio/webm' // Default content type
            });
            formData.append('model', options.model || 'whisper-1');
            formData.append('response_format', 'verbose_json');
            
            // Optional parameters
            if (options.language) {
                formData.append('language', options.language);
            }
            
            if (options.prompt) {
                formData.append('prompt', options.prompt);
            }

            // Make API request
            const response = await axios.post(this.baseURL, formData, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    ...formData.getHeaders()
                },
                timeout: 30000
            });

            const result = response.data;
            
            return {
                success: true,
                text: result.text,
                language: result.language,
                duration: result.duration,
                segments: result.segments || [],
                confidence: this.calculateAverageConfidence(result.segments || []),
                words: result.words || []
            };

        } catch (error) {
            console.error('Whisper buffer transcription error:', error);
            throw new Error(`Buffer transcription failed: ${error.message}`);
        }
    }

    /**
     * Calculate average confidence from segments
     * @param {Array} segments - Whisper segments with confidence scores
     * @returns {number} Average confidence (0-1)
     */
    calculateAverageConfidence(segments) {
        if (!segments || segments.length === 0) {
            return 0.8; // Default confidence when not available
        }

        // Some Whisper responses don't include confidence scores
        const segmentsWithConfidence = segments.filter(seg => seg.avg_logprob !== undefined);
        
        if (segmentsWithConfidence.length === 0) {
            return 0.8; // Default confidence
        }

        // Convert log probabilities to confidence scores
        const confidenceSum = segmentsWithConfidence.reduce((sum, segment) => {
            // Convert log probability to confidence (approximate)
            const confidence = Math.exp(segment.avg_logprob);
            return sum + Math.min(Math.max(confidence, 0), 1);
        }, 0);

        return confidenceSum / segmentsWithConfidence.length;
    }

    /**
     * Analyze speech patterns from transcription
     * @param {Object} transcriptionResult - Result from transcribeAudio
     * @returns {Object} Speech analysis
     */
    analyzeSpeechPatterns(transcriptionResult) {
        const { text, segments, duration, words } = transcriptionResult;
        
        if (!text) {
            return {
                wordCount: 0,
                wordsPerMinute: 0,
                fillerWords: 0,
                pauseCount: 0,
                averagePauseLength: 0,
                clarity: 0
            };
        }

        // Basic analysis
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
        const wordsPerMinute = duration > 0 ? (wordCount / duration) * 60 : 0;
        
        // Detect filler words
        const fillerWordPatterns = /\b(um|uh|er|ah|like|you know|actually|basically|literally|sort of|kind of)\b/gi;
        const fillerMatches = text.match(fillerWordPatterns) || [];
        const fillerWords = fillerMatches.length;
        
        // Analyze pauses (from segments)
        let pauseCount = 0;
        let totalPauseLength = 0;
        
        if (segments && segments.length > 1) {
            for (let i = 1; i < segments.length; i++) {
                const pauseLength = segments[i].start - segments[i-1].end;
                if (pauseLength > 0.5) { // Pause longer than 0.5 seconds
                    pauseCount++;
                    totalPauseLength += pauseLength;
                }
            }
        }
        
        const averagePauseLength = pauseCount > 0 ? totalPauseLength / pauseCount : 0;
        
        // Calculate clarity score (inverse of filler word ratio)
        const clarity = wordCount > 0 ? Math.max(0, 1 - (fillerWords / wordCount)) : 0;
        
        return {
            wordCount,
            wordsPerMinute: Math.round(wordsPerMinute),
            fillerWords,
            fillerWordRatio: wordCount > 0 ? fillerWords / wordCount : 0,
            pauseCount,
            averagePauseLength: Math.round(averagePauseLength * 100) / 100,
            clarity: Math.round(clarity * 100) / 100,
            estimatedConfidence: transcriptionResult.confidence || 0.8
        };
    }

    /**
     * Get supported languages for Whisper
     * @returns {Array} List of supported language codes
     */
    getSupportedLanguages() {
        return [
            'en', 'zh', 'de', 'es', 'ru', 'ko', 'fr', 'ja', 'pt', 'tr', 'pl', 'ca', 'nl',
            'ar', 'sv', 'it', 'id', 'hi', 'fi', 'vi', 'he', 'uk', 'el', 'ms', 'cs', 'ro',
            'da', 'hu', 'ta', 'no', 'th', 'ur', 'hr', 'bg', 'lt', 'la', 'mi', 'ml', 'cy',
            'sk', 'te', 'fa', 'lv', 'bn', 'sr', 'az', 'sl', 'kn', 'et', 'mk', 'br', 'eu',
            'is', 'hy', 'ne', 'mn', 'bs', 'kk', 'sq', 'sw', 'gl', 'mr', 'pa', 'si', 'km',
            'sn', 'yo', 'so', 'af', 'oc', 'ka', 'be', 'tg', 'sd', 'gu', 'am', 'yi', 'lo',
            'uz', 'fo', 'ht', 'ps', 'tk', 'nn', 'mt', 'sa', 'lb', 'my', 'bo', 'tl', 'mg',
            'as', 'tt', 'haw', 'ln', 'ha', 'ba', 'jw', 'su'
        ];
    }

    /**
     * Validate audio file for Whisper API
     * @param {string} filePath - Path to audio file
     * @returns {Object} Validation result
     */
    validateAudioFile(filePath) {
        try {
            const stats = fs.statSync(filePath);
            const fileSizeMB = stats.size / (1024 * 1024);
            
            // Whisper API limits
            const maxSizeMB = 25; // 25MB limit
            const supportedFormats = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'];
            
            const fileExtension = require('path').extname(filePath).toLowerCase();
            
            return {
                valid: fileSizeMB <= maxSizeMB && supportedFormats.includes(fileExtension),
                fileSize: fileSizeMB,
                maxSize: maxSizeMB,
                format: fileExtension,
                supportedFormats,
                errors: [
                    ...(fileSizeMB > maxSizeMB ? [`File size (${fileSizeMB.toFixed(1)}MB) exceeds limit (${maxSizeMB}MB)`] : []),
                    ...(!supportedFormats.includes(fileExtension) ? [`Unsupported format: ${fileExtension}`] : [])
                ]
            };
        } catch (error) {
            return {
                valid: false,
                errors: [`File validation error: ${error.message}`]
            };
        }
    }
}

module.exports = new WhisperService();
