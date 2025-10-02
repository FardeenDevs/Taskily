export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
    requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
    context: SecurityRuleContext;

    constructor(context: SecurityRuleContext) {
        const contextString = JSON.stringify(context, null, 2);
        const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${contextString}`;
        super(message);
        this.name = 'FirestorePermissionError';
        this.context = context;

        // This is to ensure the stack trace is captured correctly
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, FirestorePermissionError);
        }
    }
}
