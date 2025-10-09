import { prisma } from "@/lib/prisma";

/**
 * Allocate the next sequential document number atomically.
 * Returns the numeric sequence and a formatted string (with optional prefix/suffix/padding).
 */
export async function allocateDocumentNumber(options?: {
  prefix?: string;
  suffix?: string;
  digits?: number;
}): Promise<{ number: bigint; formatted: string }> {
  const prefix = options?.prefix ?? "";
  const suffix = options?.suffix ?? "";
  const digits = options?.digits ?? 5;

  const result = await prisma.$transaction(async (tx) => {
    // Ensure a single row exists; create if missing
    const existing = await tx.documentSequence.findUnique({ where: { id: 1 } });
    const sequenceRow = existing
      ? existing
      : await tx.documentSequence.create({ data: { id: 1, nextNumber: BigInt(1) } });

    const allocated = sequenceRow.nextNumber;
    await tx.documentSequence.update({ where: { id: 1 }, data: { nextNumber: allocated + BigInt(1) } });
    return allocated;
  });

  const numeric = BigInt(result);
  const padded = numeric.toString().padStart(digits, "0");
  const formatted = `${prefix}${padded}${suffix}`;
  return { number: numeric, formatted };
}

/**
 * Record a minimal archive entry when a document (by number) is deleted, to prevent reuse.
 */
export async function archiveDeletedDocument(params: {
  documentNo: bigint;
  reason?: string;
  metaHash?: string;
}): Promise<void> {
  await prisma.documentArchive.create({
    data: {
      documentNo: params.documentNo,
      reason: params.reason,
      metaHash: params.metaHash,
    },
  });
}


