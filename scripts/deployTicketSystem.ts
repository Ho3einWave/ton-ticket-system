import { toNano } from '@ton/core';
import { TicketSystem } from '../wrappers/TicketSystem';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ticketSystem = provider.open(TicketSystem.createFromConfig({}, await compile('TicketSystem')));

    await ticketSystem.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(ticketSystem.address);

    // run methods on `ticketSystem`
}
