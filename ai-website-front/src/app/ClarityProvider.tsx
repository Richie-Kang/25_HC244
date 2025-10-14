'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

export default function ClarityProvider() {
    useEffect(() => {
        Clarity.init("rqz9p7amtp");
    }, []);

    return null;
} 