import Section from "./Section";
import WalletTicket from "./WalletTicket";
import TicketUnlock from "./TicketUnlock";
import { useBookings } from "../lib/bookingsStore";
import { useT } from "../lib/dict";
import type { Booking } from "../lib/bookingsTypes";

/** Sort tickets so the next upcoming one leads; past ones fall to the end. */
function upcomingFirst(activities: Booking[]): Booking[] {
  const today = new Date().toISOString().slice(0, 10);
  return [...activities].sort((a, b) => {
    const ad = a.date ?? "";
    const bd = b.date ?? "";
    const aPast = ad !== "" && ad < today;
    const bPast = bd !== "" && bd < today;
    if (aPast !== bPast) return aPast ? 1 : -1;
    return ad.localeCompare(bd);
  });
}

export default function BookingsSection() {
  const { data } = useBookings();
  const t = useT();

  return (
    <Section
      id="bookings"
      eyebrow={t("bookings_eyebrow")}
      title={t("bookings_title")}
      kicker={t("bookings_kicker")}
      toned
    >
      {!data ? (
        <TicketUnlock />
      ) : (
        <div className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
          {upcomingFirst(data.activities).map((b, i) => (
            <div
              key={b.id}
              className="snap-start shrink-0 w-[86%] xs:w-[78%] sm:w-[360px] self-start"
            >
              <WalletTicket booking={b} index={i} />
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
