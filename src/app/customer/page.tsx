import { AppNav } from "@/components/app-nav";
import { ReservationBoard } from "@/components/reservation-board";
import { RoleDashboard } from "@/components/role-dashboard";
import { ToolLibrary } from "@/components/tool-library";
import { getReservations, getTools } from "@/services/seva-data";

export default async function CustomerPage() {
  const [tools, reservations] = await Promise.all([getTools(), getReservations()]);

  return (
    <>
      <AppNav />
      <main>
        <RoleDashboard role="customer" tools={tools} reservations={reservations} />
        <ToolLibrary tools={tools} />
        <ReservationBoard reservations={reservations} compact />
      </main>
    </>
  );
}
