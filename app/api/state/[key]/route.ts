import { getStateCollection } from "../../../../lib/mongodb";
import { STATE_VALIDATORS, isStateKey } from "../../../../lib/state-keys";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  if (!isStateKey(key)) {
    return Response.json({ error: "Unknown key" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!STATE_VALIDATORS[key](body)) {
    return Response.json({ error: "Invalid data" }, { status: 400 });
  }

  try {
    const collection = await getStateCollection();
    await collection.replaceOne({ _id: key }, { data: body }, { upsert: true });
    return Response.json({ ok: true });
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
    return Response.json({ error: "Failed to save data" }, { status: 500 });
  }
}
