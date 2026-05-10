import {
  Waves,
  Mountain,
  Castle,
  TreePine,
  Anchor,
  Sparkles,
  Utensils,
  Car,
  Plane,
  Sun,
  ShoppingBag,
  Bed,
  Coffee,
  Camera,
  Mountain as MountainIcon,
  type LucideIcon
} from "lucide-react";
import type { AttractionTag } from "../data/types";

const TAG_ICON: Record<AttractionTag, LucideIcon> = {
  water: Waves,
  extreme: Sparkles,
  nature: TreePine,
  culture: Castle,
  family: Sun,
  food: Utensils,
  view: Mountain,
  cave: MountainIcon,
  village: Castle
};

interface Activity {
  time?: string;
  title: string;
  description?: string;
  tag?: AttractionTag;
}

/**
 * Pick an icon for an activity row. Prefer the explicit tag,
 * then infer from the activity title + time.
 */
export function activityIcon(activity: Activity): LucideIcon {
  if (activity.tag) return TAG_ICON[activity.tag];

  const t = `${activity.title} ${activity.description ?? ""}`.toLowerCase();
  const time = (activity.time ?? "").toLowerCase();

  if (/\b(land|fly|take[-\s]?off|terminal|airport|fco|check[-\s]?in)\b/.test(t)) return Plane;
  if (/\b(drive|drove|driving|transfer|head|road|highway|return.*car|rental)\b/.test(t)) return Car;
  if (/\b(boat|sail|cruise|harbour|harbor|port|snorkel|swim|river|lake|wave|spring|cascat)\b/.test(t)) return Waves;
  if (/\b(rope|zip|adventure|adrenaline|slide|water[-\s]?park|rafting)\b/.test(t)) return Sparkles;
  if (/\b(walk|hike|trail|ridge|gondola|peak|mountain|monte)\b/.test(t)) return Mountain;
  if (/\b(forest|woods|pine)\b/.test(t)) return TreePine;
  if (/\b(town|city|piazza|tower|cathedral|museum|quarter|bridge|fortress|castle|cliff|tufa|maze)\b/.test(t)) return Castle;
  if (/\b(picnic|lunch|dinner|breakfast|chef|workshop|gelato|food|fish|trattoria|pasta)\b/.test(t)) return Utensils;
  if (/\b(grocer|supermarket|shop|conad|autogrill)\b/.test(t)) return ShoppingBag;
  if (/\b(sleep|bed|hotel|villa|home|settle|decompress|wake)\b/.test(t)) return Bed;
  if (/\b(coffee|espresso|cappuccino|wake)\b/.test(t)) return Coffee;
  if (/\b(view|vista|photo|sunset|sunrise|dawn)\b/.test(t)) return Camera;
  if (/\b(anchor|cove|cala|porto|argentario)\b/.test(t)) return Anchor;
  if (/\b(morning|early)\b/.test(time)) return Sun;

  return Camera;
}
