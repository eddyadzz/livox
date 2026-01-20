
// Check if the backend is reachable
export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        const res = await fetch('/api/health');
        return res.ok;
    } catch (e) {
        return false;
    }
};

// Send email via the backend server
export const sendEmailViaBackend = async (to: string, subject: string, body: string) => {
    const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to,
            subject,
            html: body.replace(/\n/g, '<br>'), // Simple conversion for this example
            text: body
        })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send email via server');
    }
    return res.json();
};
