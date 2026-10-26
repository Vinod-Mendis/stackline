import { getStateCollection } from "../../../lib/mongodb";
import { STATE_KEYS } from "../../../lib/state-keys";

export async function GET() {
  try {
    const collection = await getStateCollection();
    const docs = await collection.find({ _id: { $in: STATE_KEYS } }).toArray();

    const state: Record<string, unknown[]> = {};
    for (const key of STATE_KEYS) {
      state[key] = docs.find((d) => d._id === key)?.data ?? [];
    }
    return Response.json(state);
  } catch (error) {
    console.error("Failed to load state:", error);
    return Response.json({ error: "Failed to load data" }, { status: 500 });
  }
}
