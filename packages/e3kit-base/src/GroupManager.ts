import {
    CloudGroupTicketStorage,
    KeyknoxManager,
    KeyknoxCrypto,
    KeyknoxClient,
} from '@virgilsecurity/keyknox';
import { ICard, IGroupSessionMessageInfo } from './types';
import { CLOUD_GROUP_SESSIONS_ROOT } from './constants';
import { Ticket } from './groups/Ticket';
import { PrivateKeyLoader } from './PrivateKeyLoader';
import { RegisterRequiredError } from './errors';
import { Group } from './groups/Group';

const localGroupStorage = new Map<string, Group>();

export class GroupManager {
    private _privateKeyLoader: PrivateKeyLoader;

    constructor(privateKeyLoader: PrivateKeyLoader) {
        this._privateKeyLoader = privateKeyLoader;
    }

    async store(ticket: Ticket, cards: ICard[]) {
        const cloudTicketStorage = await this.getCloudTicketStorage();
        await cloudTicketStorage.store(ticket.groupSessionMessage, cards);
        const group = new Group({
            initiator: this.selfIdentity,
            tickets: [ticket],
            privateKeyLoader: this._privateKeyLoader,
        });
        // TODO store the group in device's persistent storage
        localGroupStorage.set(ticket.groupSessionMessage.sessionId, group);
        return group;
    }

    async pull(sessionId: string, initiatorCard: ICard) {
        const cloudTicketStorage = await this.getCloudTicketStorage();
        const cloudTickets = await cloudTicketStorage.retrieve(
            sessionId,
            initiatorCard.identity,
            initiatorCard.publicKey,
        );
        const group = new Group({
            initiator: initiatorCard.identity,
            tickets: cloudTickets.map(
                ct =>
                    // TODO change Buffer to string in crypto library
                    new Ticket(
                        (ct.groupSessionMessageInfo as unknown) as IGroupSessionMessageInfo,
                        ct.identities,
                    ),
            ),
            privateKeyLoader: this._privateKeyLoader,
        });
        // TODO store the group in device's persistent storage
        localGroupStorage.set(sessionId, group);
        return group;
    }

    async retrieve(sessionId: string) {
        // TODO get the group from the device's persistent storage
        return localGroupStorage.get(sessionId);
    }

    private get selfIdentity() {
        return this._privateKeyLoader.identity;
    }

    private async getCloudTicketStorage() {
        const identity = this._privateKeyLoader.identity;
        const { virgilCrypto, accessTokenProvider, apiUrl } = this._privateKeyLoader.options;
        const keyPair = await this._privateKeyLoader.loadLocalKeyPair();
        if (!keyPair) {
            throw new RegisterRequiredError();
        }

        const keyknoxManager = new KeyknoxManager(
            new KeyknoxCrypto(virgilCrypto),
            new KeyknoxClient(accessTokenProvider, apiUrl),
        );

        return new CloudGroupTicketStorage({
            keyknoxManager,
            identity,
            ...keyPair,
            root: CLOUD_GROUP_SESSIONS_ROOT,
        });
    }
}
