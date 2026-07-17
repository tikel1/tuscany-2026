import Section from "./Section";
import BookingCard from "./BookingCard";
import TicketUnlock from "./TicketUnlock";
import { useBookings } from "../lib/bookingsStore";
import { useT } from "../lib/dict";

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
        <div className="grid gap-6 md:grid-cols-2">
          {data.activities.map(b => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      )}
    </Section>
  );
}
