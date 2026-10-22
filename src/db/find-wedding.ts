import { sql } from "@/db";

/**
 * Deterministic Wedding Lookup Helper
 * 
 * Strict priority order:
 * 1. Check couple_history for an ACTIVE relation involving email (user1_email or user2_email).
 *    If found and active, retrieve that wedding row.
 * 2. Search weddings where LOWER(primary_user_email) = email.
 *    If multiple rows match, select the latest updated (ORDER BY updated_at DESC LIMIT 1).
 * 3. Search weddings where LOWER(partner_user_email) = email OR LOWER(partner_email) = email.
 *    If multiple rows match, select the latest updated (ORDER BY updated_at DESC LIMIT 1).
 * 4. Return null if no match found. Never fallback to invite code or arbitrary wedding.
 */
export async function findWeddingForEmail(email: string | null | undefined): Promise<any | null> {
  if (!email || !email.trim() || !sql) {
    return null;
  }

  const cleanEmail = email.toLowerCase().trim();

  // 1. Check couple_history for an ACTIVE relationship involving cleanEmail
  const historyRows = await sql`
    SELECT wedding_id FROM couple_history
    WHERE (LOWER(user1_email) = ${cleanEmail} OR LOWER(user2_email) = ${cleanEmail})
      AND status = 'ACTIVE'
    ORDER BY updated_at DESC LIMIT 1
  `;

  if (historyRows && historyRows.length > 0 && historyRows[0].wedding_id) {
    const wRows = await sql`
      SELECT * FROM weddings WHERE id = ${historyRows[0].wedding_id}::uuid LIMIT 1
    `;
    if (wRows && wRows.length > 0) {
      return wRows[0];
    }
  }

  // 2. Search weddings where primary_user_email = cleanEmail
  const primaryRows = await sql`
    SELECT * FROM weddings
    WHERE LOWER(primary_user_email) = ${cleanEmail}
    ORDER BY updated_at DESC LIMIT 1
  `;

  if (primaryRows && primaryRows.length > 0) {
    return primaryRows[0];
  }

  // 3. Search weddings where partner_user_email = cleanEmail OR partner_email = cleanEmail (only if actively connected!)
  const partnerRows = await sql`
    SELECT * FROM weddings
    WHERE (LOWER(partner_user_email) = ${cleanEmail}
       OR LOWER(partner_email) = ${cleanEmail})
      AND is_partner_connected = TRUE
    ORDER BY updated_at DESC LIMIT 1
  `;

  if (partnerRows && partnerRows.length > 0) {
    return partnerRows[0];
  }

  // 4. No match found -> strictly return null (no fallback to invite code or other rows)
  return null;
}
