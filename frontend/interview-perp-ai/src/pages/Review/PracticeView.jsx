import React, { useState, useRef } from 'react';
import { LuMic, LuCircleStop, LuSend } from 'react-icons/lu';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import FeedbackCard from '../../components/Cards/FeedbackCard';
import PracticeNowButton from '../../components/PracticeNowButton';

const PracticeView = ({ question, onClose }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [transcript, setTranscript] = useState('');
    const mediaRecorderRef = useRef(null);
    const recognitionRef = useRef(null);

    const startRecording = async () => {
        try {
            // 🎤 Audio Recording
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            const audioChunks = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunks, { type: 'audio/webm' });
                setAudioBlob(blob);
            };

            mediaRecorderRef.current.start();

            // 📝 Speech-to-Text
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onresult = (event) => {
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                    setTranscript(finalTranscript);
                };

                recognitionRef.current.start();
            } else {
                console.warn("SpeechRecognition API not supported in this browser.");
            }

            setIsRecording(true);
        } catch (error) {
            console.error("Microphone access denied:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsRecording(false);
    };

    const handleSendForFeedback = async () => {
        if (!audioBlob) return;
        setIsLoading(true);
        setFeedback(null);

        const formData = new FormData();
        formData.append('audio', audioBlob, 'practice-answer.webm');
        formData.append('question', question.question);
        formData.append('idealAnswer', question.answer);
        formData.append('transcript', transcript); // Send text too if needed

        try {
            const response = await axiosInstance.post(API_PATHS.AI.PRACTICE_FEEDBACK, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFeedback(response.data.feedback);
        } catch (error) {
            console.error("Failed to get feedback:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePracticeNow = () => {
        setAudioBlob(null);
        setFeedback(null);
        setTranscript('');
        startRecording();
    };

    return (
        <div className="container mx-auto p-8">
            <button onClick={onClose} className="text-sm font-medium mb-4">&larr; Back to Review</button>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-2">Practice Session</h2>
                <p className="font-semibold text-lg mb-6">{question.question}</p>

                {/* Live Transcript */}
                {transcript && (
                    <div className="bg-gray-100 p-3 rounded mb-4">
                        <p className="text-sm text-gray-700">Transcript:</p>
                        <p className="font-medium">{transcript}</p>
                    </div>
                )}

                <div className="flex items-center justify-center gap-4 my-8">
                    {!isRecording ? (
                        <button onClick={startRecording} disabled={audioBlob} className="btn-primary flex items-center gap-2">
                            <LuMic /> Start Recording
                        </button>
                    ) : (
                        <button onClick={stopRecording} className="btn-secondary bg-red-500 text-white flex items-center gap-2">
                            <LuCircleStop /> Stop Recording
                        </button>
                    )}

                    {audioBlob && !isLoading && (
                        <button onClick={handleSendForFeedback} className="btn-primary bg-green-500 text-white flex items-center gap-2">
                            <LuSend /> Get Feedback
                        </button>
                    )}
                </div>

                {isLoading && <div className="flex-center"><SpinnerLoader /></div>}
                {feedback && <FeedbackCard feedback={feedback} />}

                <div className="flex justify-center mt-6">
                    <PracticeNowButton onClick={handlePracticeNow} />
                </div>
            </div>
        </div>
    );
};

export default PracticeView;
