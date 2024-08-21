import { Address, address, Cell, Dictionary, toNano } from '@ton/core';
import { TicketSystem } from '../wrappers/TicketSystem';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const JETTON_WALLET_CODE = "b5ee9c7241020f010003d4000114ff00f4a413f4bcf2c80b010201620302001ba0f605da89a1f401f481f481a8610202ce050400114fa4430c000f2e14d804b3420c700925f04e001d0d3030171b08e85135f03db3ce0fa40fa4031fa003171d721fa0031fa003073a9b40002d31f012082100f8a7ea5ba8e85303459db3ce0208210178d4519ba8e8630444403db3ce035248210595f07bcba80e0c090602d48e843459db3ce06c22ed44d0fa00fa40fa40d43010235f032382106d8e5e3cba8e37335222c705f2e2c1820898968070fb02c8801001cb0558cf1670fa027001cb6a8210d53276db01cb1f01d33f013101cb3fc9810082fb00e0038210768a50b2bae3025f03840ff2f0080700965222c705f2e2c1d33f0101fa40fa00f40430c8801801cb055003cf1670fa0270c882100f8a7ea501cb1f500501cb3f58fa0224cf165004cf16f40070fa02ca00c97158cb6accc98040fb0000e6ed44d0fa00fa40fa40d43007d33f0101fa00fa40305151a15249c705f2e2c127c2fff2e2c2058209ab3f00a016bcf2e2c3c882107bdd97de01cb1f500501cb3f5003fa0222cf1601cf16c9c8801801cb0523cf1670fa02017158cb6accc98040fb004013c85004fa0258cf1601cf16ccc9ed5402f6ed44d0fa00fa40fa40d43008d33f0101fa005151a005fa40fa40535bc70554736d70542013541403c85004fa0258cf1601cf16ccc922c8cb0112f400f400cb00c9f9007074c8cb02ca07cbffc9d0500dc7051cb1f2e2c30afa0051a8a12195104a395f04e30d048208989680b60972fb0225d70b01c30003c200130b0a007cb08e26c8801001cb055005cf1670fa027001cb6a8210d53276db01cb1f500301cb3fc9810082fb0012923333e25003c85004fa0258cf1601cf16ccc9ed540072521aa018a1c882107362d09c01cb1f2401cb3f5003fa0201cf165008cf16c9c8801001cb0524cf165006fa0250057158cb6accc971fb00103501f603d33f0101fa00fa4021f002ed44d0fa00fa40fa40d4305136a1522ac705f2e2c128c2fff2e2c254344270542013541403c85004fa0258cf1601cf16ccc922c8cb0112f400f400cb00c920f9007074c8cb02ca07cbffc9d004fa40f40431fa0020d749c200f2e2c4c88210178d451901cb1f500a01cb3f5008fa020d00a223cf1601cf1626fa025007cf16c9c8801801cb055004cf1670fa024063775003cb6bcccc2391729171e25008a813a0820a43d580a014bcf2e2c504c98040fb004013c85004fa0258cf1601cf16ccc9ed54008a8020d721ed44d0fa00fa40fa40d43004d31f018200fff0218210178d4519ba0282107bdd97deba12b1f2f4d33f0130fa003013a05023c85004fa0258cf1601cf16ccc9ed541c9f642f"
    const sender = provider.sender()
    let wallet_code = Cell.fromBoc(Buffer.from(JETTON_WALLET_CODE, "hex"))
    const ticketSystem = provider.open(TicketSystem.createFromConfig({
        hoster_address: sender.address!,
        o1_master: address("kQDAiO286SYcHCnj6-U_bWIBbURv14yqptYPvMWzVfC7WI-J"),
        omini_master: address("kQAuG2F399vT2Bsf_lYAXzZKpSjVP7Y7No9d--6BiX_Dq7kv"),
        jetton_wallet_code: wallet_code[0],
        total_sale: 0n,
        users: Dictionary.empty<bigint, bigint>(Dictionary.Keys.BigInt(256), Dictionary.Values.BigUint(32))

    }, await compile('TicketSystem')));

    await ticketSystem.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(ticketSystem.address);

    // run methods on `ticketSystem`
}
