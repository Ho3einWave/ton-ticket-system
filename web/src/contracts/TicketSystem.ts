import { Address, beginCell, Builder, Cell, Contract, contractAddress, ContractProvider, Dictionary, DictionaryValue, Sender, SendMode, Slice, TupleBuilder } from '@ton/core';

export type TicketSystemConfig = {
    total_sale: bigint,
    users: Dictionary<bigint, bigint>,
    hoster_address: Address,
    o1_master: Address,
    omini_master: Address,
    jetton_wallet_code: Cell
};

export const addressDictionaryValue: DictionaryValue<bigint> = {
    serialize: function (num: bigint, builder: Builder) {
        builder
            .storeUint(num, 32)
    },
    parse: function (address: Slice): bigint {
        return BigInt(address.loadUint(32))
    },
}

export function ticketSystemConfigToCell(config: TicketSystemConfig): Cell {
    return beginCell()
        .storeUint(config.total_sale, 32)
        .storeDict(config.users)
        .storeAddress(config.hoster_address)
        .storeAddress(config.o1_master)
        .storeAddress(config.omini_master)
        .storeRef(config.jetton_wallet_code)
        .endCell();
}

export class TicketSystem implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

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

    async getTotalSale(provider: ContractProvider): Promise<bigint> {
        const { stack } = await provider.get('get_total_sale', [])
        return stack.readBigNumber()
    }
    async getHosterAddress(provider: ContractProvider): Promise<Address> {
        const { stack } = await provider.get('get_hoster_addr', [])
        return stack.readAddress()
    }
    async getLastAddress(provider: ContractProvider): Promise<Address> {
        const { stack } = await provider.get('get_last_addr', [])
        return stack.readAddress()
    }
    async getAllUsers(provider: ContractProvider) {
        const { stack } = await provider.get('get_users', [])
        const dict = Dictionary.loadDirect(Dictionary.Keys.BigUint(256), addressDictionaryValue, stack.readCellOpt())
        return dict

    }
    async getUserTickets(provider: ContractProvider, address: Address) {
        const tb = new TupleBuilder()
        tb.writeAddress(address)
        const { stack } = await provider.get('get_user_tickets', tb.build())
        return stack.readBigNumberOpt()
    }
}
