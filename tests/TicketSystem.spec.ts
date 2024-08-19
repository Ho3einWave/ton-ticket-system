import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { TicketSystem } from '../wrappers/TicketSystem';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('TicketSystem', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TicketSystem');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let ticketSystem: SandboxContract<TicketSystem>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        ticketSystem = blockchain.openContract(TicketSystem.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await ticketSystem.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: ticketSystem.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and ticketSystem are ready to use
    });
});
