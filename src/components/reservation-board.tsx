import { StatusPill } from "@/components/ui/status-pill";
import type { Reservation } from "@/types/seva";

type ReservationBoardProps = {
  reservations: Reservation[];
  compact?: boolean;
};

export function ReservationBoard({ reservations, compact = false }: ReservationBoardProps) {
  return (
    <section className="section-block">
      <div className="section-heading">
        <p className="eyebrow">Tool Reservation</p>
        <h2>Requests, approvals, pickup, and return in one queue.</h2>
      </div>

      <div className="table-shell">
        <div className="reservation-row reservation-head">
          <span>Reservation</span>
          <span>Tool</span>
          {!compact && <span>Customer</span>}
          <span>Dates</span>
          <span>Status</span>
        </div>
        {reservations.map((reservation) => (
          <div className="reservation-row" key={reservation.id}>
            <strong>{reservation.id}</strong>
            <span>{reservation.toolName}</span>
            {!compact && <span>{reservation.customerName}</span>}
            <span>
              {reservation.startDate} to {reservation.endDate}
            </span>
            <StatusPill status={reservation.status} />
          </div>
        ))}
      </div>
    </section>
  );
}
