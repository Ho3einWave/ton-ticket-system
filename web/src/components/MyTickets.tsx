import { useTicketSystem } from '../hooks/useTicket';
import { useQuery } from '@tanstack/react-query';
import { address } from '@ton/core';
import TicketAnimation from '../assets/ticket.json';
import Lottie from 'lottie-react';
const MyTickets = ({ owner }: { owner: string | undefined }) => {
    const { ticketSystem } = useTicketSystem();
    const { data } = useQuery({
        queryKey: ['ticket-total', ticketSystem, owner],
        queryFn: async () => {
            if (ticketSystem && owner) {
                const totalSale = await ticketSystem.getUserTickets(address(owner));
                return Number(totalSale);
            }
        },
    });
    return data ? (
        <div className="flex items-center gap-1  p-3 px-4 my-2 bg-zinc-900 rounded-full">
            <Lottie animationData={TicketAnimation} className="w-[24px]" loop={true} />
            You have {data} tickets
        </div>
    ) : (
        <></>
    );
};

export default MyTickets;
