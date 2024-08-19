import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type TicketSystemConfig = {};

export function ticketSystemConfigToCell(config: TicketSystemConfig): Cell {
    return beginCell().endCell();
}

export class TicketSystem implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new TicketSystem(address);
    }

    static createFromConfig(config: TicketSystemConfig, code: Cell, workchain = 0) {
        const data = ticketSystemConfigToCell(config);
        const init = { code, data };
        return new TicketSystem(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
