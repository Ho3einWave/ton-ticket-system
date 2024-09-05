import { address, OpenedContract } from '@ton/core';
import { create } from 'zustand';
import { TicketSystem } from '../contracts/TicketSystem';
import { TonClient } from '@ton/ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { contractAddress } from '../constants';

type State = {
    ticketSystem: OpenedContract<TicketSystem> | null;
    client: TonClient | null;
};

type Action = {
    setupTicketSystem: () => void;
};

// Create your store, which includes both state and (optionally) actions
export const useTicketSystem = create<State & Action>((set, get) => ({
    ticketSystem: null,
    client: null,
    setupTicketSystem: async () => {
        const currTicketSystem = get().ticketSystem;
        if (currTicketSystem) return;
        const client = new TonClient({
            endpoint: await getHttpEndpoint({ network: 'testnet' }),
        });
        const ticketSystem = client.open(TicketSystem.createFromAddress(address(contractAddress)));
        set(() => ({ ticketSystem, client }));
    },
}));
