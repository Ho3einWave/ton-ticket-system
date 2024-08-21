import { useTicketSystem } from '../hooks/useTicket';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@nextui-org/react';

const TicketsLeft = () => {
    const { ticketSystem } = useTicketSystem();
    const { data } = useQuery({
        queryKey: ['ticket-total', ticketSystem],
        queryFn: async () => {
            if (ticketSystem) {
                const totalSale = await ticketSystem.getTotalSale();
                return Number(totalSale);
            }
        },
    });
    return (
        <div className="flex items-center gap-1">
            {data !== undefined ? 1000 - data : <Skeleton className="w-10 h-5 rounded-2xl" />} Tickets left
        </div>
    );
};

export default TicketsLeft;
