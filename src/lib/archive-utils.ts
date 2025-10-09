import { createHash } from "crypto";
import { archiveDeletedDocument } from "@/lib/document-number-allocator";

export function computeSha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export async function archiveOnDelete(params: {
  documentNo: bigint;
  reason?: string;
  rawContentForHash?: string;
}): Promise<void> {
  const metaHash = params.rawContentForHash ? computeSha256(params.rawContentForHash) : undefined;
  await archiveDeletedDocument({ documentNo: params.documentNo, reason: params.reason, metaHash });
}


