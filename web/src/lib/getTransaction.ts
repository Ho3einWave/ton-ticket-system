import { Address, address, toNano, } from "@ton/ton"
import { useTicketSystem } from "../hooks/useTicket"
import { JettonMinter } from "../contracts/JettonMaster"
import { JettonWallet } from "../contracts/JettonWallet"
import { contractAddress } from "../constants"

export default async (owner: Address, paywith: "o1" | "o-mini", how_many: number) => {
    const contractAddr = address(contractAddress)
    const client = useTicketSystem.getState().client!
    if (paywith === "o1") {
        const O1master = client.open(JettonMinter.createFromAddress(address("kQDAiO286SYcHCnj6-U_bWIBbURv14yqptYPvMWzVfC7WI-J")))
        const o1WalletAddr = await O1master.getWalletAddress(owner)
        // const o1ContractAddr = await O1master.getWalletAddress(contractAddr)
        // const o1Wallet = client.open(JettonWallet.createFromAddress(o1WalletAddr))
        // @ts-expect-error
        const cell = JettonWallet.transferMessage(toNano(`${how_many}`), contractAddr, owner, null, toNano("0.01"), null)
        const message = {
            address: o1WalletAddr.toString(),
            amount: toNano("0.05").toString(),
            payload: cell.toBoc().toString("base64")
        }
        return message
    } else {
        const Ominimaster = client.open(JettonMinter.createFromAddress(address("kQAuG2F399vT2Bsf_lYAXzZKpSjVP7Y7No9d--6BiX_Dq7kv")))
        const ominiWallet = await Ominimaster.getWalletAddress(owner)
        // const o1ContractAddr = await Ominimaster.getWalletAddress(contractAddr)
        // @ts-expect-error
        const cell = JettonWallet.transferMessage(toNano(`${how_many * 2}`), contractAddr, owner, null, toNano("0.01"), null)
        const message = {
            address: ominiWallet.toString(),
            amount: toNano("0.05").toString(),
            payload: cell.toBoc().toString("base64")
        }
        return message
    }


}