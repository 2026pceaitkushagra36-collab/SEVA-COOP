import type { Reservation } from "@/types/seva";

type QrPanelProps = {
  reservation: Reservation;
};

export function QrPanel({ reservation }: QrPanelProps) {
  return (
    <section className="qr-panel">
      <div>
        <p className="eyebrow">QR Pickup / Return</p>
        <h2>Scan linked reservation code at handover.</h2>
        <p className="muted">
          Workers verify pickup and return against the same reservation record, keeping
          inventory status in sync.
        </p>
      </div>
      <div className="qr-card" aria-label={`QR code for ${reservation.id}`}>
        {Array.from({ length: 49 }).map((_, index) => (
          <span
            className={(index * 7 + reservation.qrCode.length) % 5 < 2 ? "filled" : ""}
            key={index}
          />
        ))}
        <strong>{reservation.qrCode}</strong>
      </div>
    </section>
  );
}
