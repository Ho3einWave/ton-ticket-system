import { CHAIN, TonConnectButton, useTonConnectModal, useTonConnectUI } from '@tonconnect/ui-react';
import { Button, Slider, useDisclosure } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import DuckAnimation from '../assets/duck.json';
import Lottie from 'lottie-react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import { useTicketSystem } from '../hooks/useTicket';
import TicketsLeft from '../components/TicketsLeft';
import MessageAnimation from '../assets/message.json';
import getTransaction from '../lib/getTransaction';
import { address, Cell } from '@ton/core';
import MyTickets from '../components/MyTickets';
const App = () => {
    const { isOpen, onOpenChange } = useDisclosure();

    const { setupTicketSystem } = useTicketSystem();
    const [tonConnectUI, setOptions] = useTonConnectUI();
    const { open } = useTonConnectModal();
    const [walletConnected, setWalletConnected] = useState(false);
    tonConnectUI.onStatusChange((status) => {
        if (status) {
            setWalletConnected(true);
        } else {
            setWalletConnected(false);
        }
    });
    const handleBuyClick = () => {
        if (walletConnected) {
            onOpenChange();
        } else {
            open();
        }
    };

    const [buyCount, setBuyCount] = useState(1);
    const handlePay = async (pay_with: 'o1' | 'o-mini') => {
        const message = await getTransaction(address(tonConnectUI.account!.address), pay_with, buyCount);
        tonConnectUI
            .sendTransaction({ messages: [message], validUntil: Date.now() + 500 * 60 * 1000, network: CHAIN.TESTNET })
            .then((res) => {
                const boc = Cell.fromBase64(res.boc);
                console.log(boc.hash().toString('hex'));
            })
            .catch((e) => {
                console.log(e);
            });

        onOpenChange();
    };

    useEffect(() => {
        setupTicketSystem();
        setOptions({ actionsConfiguration: { modals: ['before', 'error', 'success'] } });
    }, []);
    const buttonText = walletConnected ? 'BUY' : 'CONNECT WALLET';
    return (
        <div className="max-w-[400px] mx-auto py-10">
            <div className=" p-2 px-4  rounded-xl">
                <nav className="w-full flex items-center justify-between">
                    <div className="font-black text-xl text-blue-400">TON Tickets</div>
                    <div>
                        <TonConnectButton />
                    </div>
                </nav>
                <div className="max-w-[98%] mx-auto py-5">
                    <div className="my-4 ">
                        <Lottie animationData={DuckAnimation} loop={true} />
                        <div className="mt-2 flex items-center justify-between">
                            <h1 className="">Show: Ecosystem roundup</h1>
                            <TicketsLeft />
                        </div>
                    </div>
                    <MyTickets owner={tonConnectUI.account?.address} />
                    <div>
                        <Slider
                            size="lg"
                            step={1}
                            color="primary"
                            label="Tickets"
                            showSteps={true}
                            value={buyCount}
                            onChange={(e) => {
                                if (typeof e === 'number') {
                                    setBuyCount(e);
                                }
                            }}
                            maxValue={10}
                            minValue={1}
                            defaultValue={buyCount}
                            className="max-w-md"
                        />

                        <Button onClick={handleBuyClick} className="w-full mt-4" color="primary" size="lg">
                            {buttonText}
                        </Button>
                    </div>
                </div>
            </div>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Buy ticket</ModalHeader>
                            <ModalBody>
                                <Lottie animationData={MessageAnimation} className="w-[150px] mx-auto" loop={true} />
                                <h1 className="text-center text-2xl font-bold">Buy {buyCount} ticket</h1>
                            </ModalBody>
                            <ModalFooter className="flex flex-col">
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        className="w-full"
                                        onPress={() => {
                                            handlePay('o1');
                                        }}
                                    >
                                        Pay with O1
                                    </Button>
                                    <Button
                                        color="success"
                                        variant="flat"
                                        className="w-full"
                                        onPress={() => {
                                            handlePay('o-mini');
                                        }}
                                    >
                                        Pay with O-mini
                                    </Button>
                                </div>
                                <Button color="danger" className="w-full" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default App;
