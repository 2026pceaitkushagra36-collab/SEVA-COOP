import { AppNav } from "@/components/app-nav";
import { QrPanel } from "@/components/qr-panel";
import { ReservationBoard } from "@/components/reservation-board";
import { RoleDashboard } from "@/components/role-dashboard";
import { getReservations, getTools } from "@/services/seva-data";

export default async function WorkerPage() {
  const [tools, reservations] = await Promise.all([getTools(), getReservations()]);

  return (
    <>
      <AppNav />
      <main>
        <RoleDashboard role="worker" tools={tools} reservations={reservations} />
        <ReservationBoard reservations={reservations} />
        {reservations[0] && <QrPanel reservation={reservations[0]} />}
      </main>
    </>
  );
}
