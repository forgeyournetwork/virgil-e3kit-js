/**
 * @hidden
 */
export const DUPLICATE_IDENTITIES = 'Identities in array should be unique';
/**
 * @hidden
 */
export const EMPTY_ARRAY = `Array should be non empty`;
/**
 * @hidden
 */
export const throwIllegalInvocationError = (method: string) => {
    throw new Error(`Calling ${method} two or more times in a row is not allowed.`);
};

/**
 * Custom error class for errors specific to Virgil E3kit.
 */

export class SdkError extends Error {
    name: string;
    constructor(m: string, name: string = 'SdkError') {
        super(m);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
    }
}

/**
 * Error thrown by {@link EThree.register} when identity is already registered on Virgil Cloud.
 * To load private key use EThree.restorePrivateKey or EThree.rotatePrivateKey.
 */
export class IdentityAlreadyExistsError extends SdkError {
    constructor() {
        super(
            'This identity is already registered on Virgil Cloud. To load private key use EThree.restorePrivateKey or EThree.rotatePrivateKey',
            'IdentityAlreadyExistsError',
        );
    }
}

/**
 * Error thrown by {@link EThree.encrypt}, {@link EThree.decrypt} and {@link EThree.backupPrivateKey}
 * when current identity of E3kit instance is not registered.
 */
export class RegisterRequiredError extends SdkError {
    constructor() {
        super('This identity is not registered', 'RegisterRequiredError');
    }
}

/**
 * Error thrown by {@link EThree.backupPrivateKey},  {@link EThree.changePassword} and
 * {@link EThree.resetPrivateKeyBackup} when user enters wrong password.
 */
export class WrongKeyknoxPasswordError extends SdkError {
    constructor() {
        super('Password from remote private key storage is invalid', 'WrongKeyknoxPasswordError');
    }
}

/**
 * Error thrown by {@link EThree.rotatePrivateKey} and {@link EThree.restorePrivateKey}
 */
export class PrivateKeyAlreadyExistsError extends SdkError {
    constructor() {
        super(
            'You already have a private key. Use EThree.cleanup() to delete it. If you delete the last copy of the private key, you will not be able to decrypt any information encrypted for this private key',
            'PrivateKeyAlreadyExistsError',
        );
    }
}

/**
 * Error thrown by {@link EThree.resetPrivateKeyBackup} when backup copy of private key doesn't exist
 */
export class PrivateKeyNoBackupError extends SdkError {
    constructor() {
        super("Backup copy of private key doesn't exist", 'PrivateKeyNoBackupError');
    }
}

/**
 * Error thrown by {@link EThree.register}, {@link EThree.rotatePrivateKey} and {@link EThree.lookupPublicKeys}
 * when one user has more then one card.
 */
export class MultipleCardsError extends SdkError {
    constructor(public identity: string) {
        super(
            `There are several public keys registered with ${identity}, which is not supported.`,
            'MultipleCardsError',
        );
    }
}

export type LookupResultWithErrors = {
    [identity: string]:
        | import('virgil-crypto/dist/virgil-crypto-pythia.es').VirgilPublicKey
        | Error;
};

/**
 * Error thrown by {@link EThree.lookupPublicKeys} in case if some identity missing or has multiple cards.
 */
export class LookupError extends SdkError {
    /**
     * Key Value object, where key is identity and value is VirgilPublicKey or [[MultipleCardsError]] or [[LookupNotFoundError]]
     */
    public lookupResult: LookupResultWithErrors;
    constructor(lookupResult: LookupResultWithErrors) {
        super(
            'Failed some public keys lookups. You can see the results by calling error.lookupResult property of this error instance',
            'LookupError',
        );
        this.lookupResult = lookupResult;
    }
}

/**
 * Error thrown by {@link EThree.lookupPublicKeys} in case if sought identity is not registered.
 */
export class LookupNotFoundError extends SdkError {
    constructor(public identity: string) {
        super(`${identity} not found`, 'LookupNotFoundError');
    }
}

export class IntegrityCheckFailedError extends SdkError {
    constructor(message: string) {
        super(message, 'IntegrityCheckFailedError');
    }
}
