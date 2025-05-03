'use client';

import React, { useEffect } from 'react';
import { Mic, StopCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface DictaphoneControllerProps {
    onTranscriptChange: (transcript: string) => void;
}

const DictaphoneController: React.FC<DictaphoneControllerProps> = ({ onTranscriptChange }) => {
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            onTranscriptChange(transcript);
        }
    }, [transcript, onTranscriptChange]);

    const toggleListening = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            resetTranscript();
            SpeechRecognition.startListening({ continuous: true });
        }
    };

    if (!browserSupportsSpeechRecognition) {
        return null; // Don't render anything if speech recognition is not supported
    }

    return (
        <Button
            type="button"
            size="icon"
            variant={listening ? "destructive" : "ghost"}
            className="h-10 w-10"
            onClick={toggleListening}
            aria-label={listening ? "Stop recording" : "Record with microphone"}
        >
            {listening ? (
                <StopCircle className="h-5 w-5" />
            ) : (
                <Mic className="h-5 w-5" />
            )}
        </Button>
    );
};

export default DictaphoneController; 