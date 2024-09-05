import {
    Address,
    beginCell,
    Cell,
    type Contract,
    contractAddress,
    type ContractProvider,
    type Sender,
    SendMode,
    toNano,
} from '@ton/ton';

export type JettonMinterContent = {
    type: 0 | 1;
    uri: string;
};

export const JETTON_MASTER_CODE =
    'b5ee9c7241020e010002db000114ff00f4a413f4bcf2c80b01020162050202037a600403001faf16f6a2687d007d206a6a183faa9040007dadbcf6a2687d007d206a6a183618fc1400b82a1009aa0a01e428027d012c678b00e78b666491646580897a007a00658064fc80383a6465816503e5ffe4e8400202cb07060099a17c142201b82a1009aa0a01e428027d012c678b00e78b666491646580897a007a00658064907c80383a6465816503e5ffe4e864400c00e58280e78b2801fd012cbba801e5b5e66664b8fd804004c5d0831c02497c0f8007434c0c05c6c2497c0f83e903e900c7e800c5c75c87e800c7e800c1cea6d0000b4c7c04074cfc07b51343e803e9035350c09a084059d2c282eb8c089a0841ef765f7aeb8c089a0840b1dae5ceeb8c08d0dcdc8e08412101993eea0d0b090800928e1b335035c705f2e04c01fa40304003c85004fa0258cf16ccccc9ed54e0350282105773d1f5ba8e195124c705f2e04d01d4304300c85004fa0258cf16ccccc9ed54e05f05840ff2f001a6365f03048208989680a015bcf2e04b03fa40d3003095c821cf16c9916de2c8801801cb055003cf1670fa027001cb6a8210d173540001cb1f500301cb3f22fa4430c000966c227001cb01e30df400c98040fb000a0068f828430470542013541403c85004fa0258cf1601cf16ccc922c8cb0112f400f400cb00c9f9007074c8cb02ca07cbffc9d012cf1601c236373702fa00fa40f82854120670542013541403c85004fa0258cf1601cf16ccc922c8cb0112f400f400cb00c9f9007074c8cb02ca07cbffc9d05006c705f2e04a12a1034545c85004fa0258cf16ccccc9ed5401fa403020d70b01c300915be30d0c0044c8801001cb0501cf1670fa027001cb6a8210d53276db01cb1f0101cb3fc98042fb0000a43637375146c705f2e04901fa40fa00fa00fa00305301bcf2e04b7020c88210178d451901cb1f500701cb3f24fa0216cb01f828cf1658fa0214cb00c9544444f01212a05520c85004fa0258cf16ccccc9ed5422022599';

export type JettonMinterConfig = { admin: Address; content: Cell; wallet_code: Cell };

export function jettonMinterConfigToCell(config: JettonMinterConfig): Cell {
    return beginCell()
        .storeCoins(0)
        .storeAddress(config.admin)
        .storeRef(config.content)
        .storeRef(config.wallet_code)
        .endCell();
}

export function jettonContentToCell(content: JettonMinterContent) {
    return beginCell()
        .storeUint(content.type, 8)
        .storeStringTail(content.uri) //Snake logic under the hood
        .endCell();
}

export class JettonMinter implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new JettonMinter(address);
    }

    static createFromConfig(config: JettonMinterConfig, code: Cell, workchain = 0) {
        const data = jettonMinterConfigToCell(config);
        const init = { code, data };
        return new JettonMinter(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    static mintMessage(to: Address, jetton_amount: bigint, forward_ton_amount: bigint, total_ton_amount: bigint) {
        return beginCell()
            .storeUint(0x1674b0a0, 32)
            .storeUint(0, 64) // op, queryId
            .storeAddress(to)
            .storeCoins(jetton_amount)
            .storeCoins(forward_ton_amount)
            .storeCoins(total_ton_amount)
            .endCell();
    }
    async sendMint(
        provider: ContractProvider,
        via: Sender,
        to: Address,
        jetton_amount: bigint,
        forward_ton_amount: bigint,
        total_ton_amount: bigint,
    ) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.mintMessage(to, jetton_amount, forward_ton_amount, total_ton_amount),
            value: total_ton_amount + toNano('0.1'),
        });
    }

    /* provide_wallet_address#2c76b973 query_id:uint64 owner_address:MsgAddress include_address:Bool = InternalMsgBody;
     */
    static discoveryMessage(owner: Address, include_address: boolean) {
        return beginCell()
            .storeUint(0x2c76b973, 32)
            .storeUint(0, 64) // op, queryId
            .storeAddress(owner)
            .storeBit(include_address)
            .endCell();
    }

    async sendDiscovery(
        provider: ContractProvider,
        via: Sender,
        owner: Address,
        include_address: boolean,
        value: bigint = toNano('0.1'),
    ) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.discoveryMessage(owner, include_address),
            value: value,
        });
    }

    static changeAdminMessage(newOwner: Address) {
        return beginCell()
            .storeUint(0x4840664f, 32)
            .storeUint(0, 64) // op, queryId
            .storeAddress(newOwner)
            .endCell();
    }

    async sendChangeAdmin(provider: ContractProvider, via: Sender, newOwner: Address) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.changeAdminMessage(newOwner),
            value: toNano('0.1'),
        });
    }
    static changeContentMessage(content: Cell) {
        return beginCell()
            .storeUint(0x5773d1f5, 32)
            .storeUint(0, 64) // op, queryId
            .storeRef(content)
            .endCell();
    }

    async sendChangeContent(provider: ContractProvider, via: Sender, content: Cell) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinter.changeContentMessage(content),
            value: toNano('0.1'),
        });
    }
    async getWalletAddress(provider: ContractProvider, owner: Address): Promise<Address> {
        const res = await provider.get('get_wallet_address', [
            { type: 'slice', cell: beginCell().storeAddress(owner).endCell() },
        ]);
        return res.stack.readAddress();
    }

    async getJettonData(provider: ContractProvider) {
        const res = await provider.get('get_jetton_data', []);
        const totalSupply = res.stack.readBigNumber();
        const mintable = res.stack.readBoolean();
        const adminAddress = res.stack.readAddress();
        const content = res.stack.readCell();
        const walletCode = res.stack.readCell();
        return {
            totalSupply,
            mintable,
            adminAddress,
            content,
            walletCode,
        };
    }

    async getTotalSupply(provider: ContractProvider) {
        const res = await this.getJettonData(provider);
        return res.totalSupply;
    }
    async getAdminAddress(provider: ContractProvider) {
        const res = await this.getJettonData(provider);
        return res.adminAddress;
    }
    async getContent(provider: ContractProvider) {
        const res = await this.getJettonData(provider);
        return res.content;
    }
}
