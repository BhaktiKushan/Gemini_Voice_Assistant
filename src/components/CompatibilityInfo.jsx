import React, { memo } from 'react';
import { AlertCircle } from 'lucide-react';

const CompatibilityInfo = memo(function CompatibilityInfo({ speechSupported, isIOS }) {
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(ua);
    const isChrome = /chrome/.test(ua) && !/edg/.test(ua);
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';

    if (speechSupported && !isIOS && !(isAndroid && !isChrome)) return null;

    let title, message;

    if (isIOS) {
        title = 'iOS Safari Required';
        message = 'Voice recognition works best in Safari on iOS devices. Please use Safari for voice features.';
    } else if (isAndroid && !isChrome) {
        title = 'Chrome Required for Voice';
        message = 'Voice recognition requires Google Chrome on Android. Please open this page in Chrome.';
    } else if (isAndroid && !isSecure) {
        title = 'HTTPS Required for Voice';
        message = 'Voice recognition requires a secure connection (HTTPS). Please use a secure connection.';
    } else {
        title = 'Voice Not Available';
        message = 'Voice recognition is not supported in this browser. Please use text mode or switch to Chrome.';
    }

    return (
        <div className="w-full max-w-md mx-auto mb-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-yellow-300 text-sm font-medium mb-1">{title}</p>
                    <p className="text-yellow-200 text-xs">{message}</p>
                </div>
            </div>
        </div>
    );
});

export default CompatibilityInfo;
