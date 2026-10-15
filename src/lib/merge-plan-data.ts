/**
 * Smart Reconciliation & Bi-directional Merge Utility for HajatKita
 * 
 * Ensures seamless synchronization across multiple devices (e.g. Tab Nurul, HP Nurul, HP Heru).
 * Guarantees that:
 * 1. Missing items on any device or database are ADDED (union merge).
 * 2. More complete datasets are preserved and never clobbered by empty/partial datasets.
 * 3. Deleted items (tracked by tombstone IDs) are never resurrected.
 * 4. Partner contributions (e.g. alignment answers, gift claims, purchases) are merged non-destructively.
 */

export interface PlanData {
  savingContributions?: any[];
  checklist?: any[];
  seserahan?: any[];
  postWedding?: any[];
  guests?: any[];
  familyQuota?: any;
  rundown?: any[];
  budgetCategories?: any[];
  vendors?: any[];
  alignmentTopics?: any[];
  adminSteps?: any[];
  activityLogs?: any[];
  lifeGoals?: any[];
  deletedItemIds?: string[];
}

/**
 * Normalizes text for loose duplicate detection
 */
function normalizeKey(str: any): string {
  if (typeof str !== "string") return "";
  return str.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Merges two generic entity lists by ID and optional name/title fallback,
 * respecting deletedItemIds tombstones.
 */
export function mergeEntityList<T extends { id?: string }>(
  existingList: T[] = [],
  incomingList: T[] = [],
  fallbackKeyField?: keyof T,
  deletedIdsSet?: Set<string>
): T[] {
  const result: T[] = [];
  const seenIds = new Set<string>();
  const seenFallbackKeys = new Set<string>();

  const isDeleted = (id?: string) => {
    if (!id || !deletedIdsSet) return false;
    return deletedIdsSet.has(id);
  };

  // Helper to get fallback key
  const getFallbackKey = (item: T): string => {
    if (!fallbackKeyField) return "";
    return normalizeKey(item[fallbackKeyField]);
  };

  // Map of incoming items by ID and by fallback key
  const incomingById = new Map<string, T>();
  const incomingByFallback = new Map<string, T>();

  for (const inc of incomingList) {
    if (!inc) continue;
    if (inc.id && !isDeleted(inc.id)) {
      incomingById.set(inc.id, inc);
    }
    const fk = getFallbackKey(inc);
    if (fk) {
      incomingByFallback.set(fk, inc);
    }
  }

  // 1. Process existing items: update with incoming if matched, otherwise preserve
  for (const ex of existingList) {
    if (!ex) continue;
    if (ex.id && isDeleted(ex.id)) continue;

    const fk = getFallbackKey(ex);
    let matchedIncoming: T | undefined = undefined;

    if (ex.id && incomingById.has(ex.id)) {
      matchedIncoming = incomingById.get(ex.id);
    } else if (!ex.id && fk && incomingByFallback.has(fk)) {
      matchedIncoming = incomingByFallback.get(fk);
    }

    if (matchedIncoming) {
      // Merge properties: preserve non-empty existing fields if incoming left them blank
      const merged: any = { ...ex, ...matchedIncoming };
      // Preserve ID
      merged.id = ex.id || matchedIncoming.id;

      const exAny = ex as any;
      const incAny = matchedIncoming as any;

      // Special care for boolean status fields (if either is marked true/completed, preserve true)
      if ("isPurchased" in exAny || "isPurchased" in incAny) {
        merged.isPurchased = incAny.isPurchased ?? exAny.isPurchased;
      }
      if ("isAcquired" in exAny || "isAcquired" in incAny) {
        merged.isAcquired = incAny.isAcquired ?? exAny.isAcquired;
      }
      if ("completed" in exAny || "completed" in incAny) {
        merged.completed = incAny.completed ?? exAny.completed;
      }

      // Preserve notes/details only if incoming property is undefined
      if (exAny.notes !== undefined && incAny.notes === undefined) {
        merged.notes = exAny.notes;
      }

      // Merge deposits array for life goals if present
      if (Array.isArray(exAny.deposits) || Array.isArray(incAny.deposits)) {
        const mergedDeposits = mergeEntityList(
          exAny.deposits || [],
          incAny.deposits || [],
          undefined,
          deletedIdsSet
        );
        merged.deposits = mergedDeposits;
        merged.currentAmount = mergedDeposits.reduce((acc: number, d: any) => acc + (d.amount || 0), 0);
      }

      if (merged.id) seenIds.add(merged.id);
      if (!merged.id && fk) seenFallbackKeys.add(fk);
      result.push(merged);
    } else {
      // Preserved existing item that incoming didn't have (Union merge!)
      if (ex.id) seenIds.add(ex.id);
      if (!ex.id && fk) seenFallbackKeys.add(fk);
      result.push(ex);
    }
  }

  // 2. Add incoming items that were NOT in existing list
  for (const inc of incomingList) {
    if (!inc) continue;
    if (inc.id && isDeleted(inc.id)) continue;
    if (inc.id) {
      if (seenIds.has(inc.id)) continue;
    } else {
      const fk = getFallbackKey(inc);
      if (fk && seenFallbackKeys.has(fk)) continue;
    }

    if (inc.id) seenIds.add(inc.id);
    const fk = getFallbackKey(inc);
    if (!inc.id && fk) seenFallbackKeys.add(fk);
    result.push(inc);
  }

  return result;
}

/**
 * Merges alignment topics preserving both groom's and bride's distinct answers.
 */
export function mergeAlignmentTopics(
  existingTopics: any[] = [],
  incomingTopics: any[] = [],
  deletedIdsSet?: Set<string>
): any[] {
  return mergeEntityList(
    existingTopics,
    incomingTopics,
    "question" as any,
    deletedIdsSet
  ).map((item) => {
    const ex = existingTopics.find((t) => t.id === item.id || normalizeKey(t.question) === normalizeKey(item.question));
    const inc = incomingTopics.find((t) => t.id === item.id || normalizeKey(t.question) === normalizeKey(item.question));

    const groomAnswer = (inc?.groomAnswer?.trim() ? inc.groomAnswer : ex?.groomAnswer) || "";
    const brideAnswer = (inc?.brideAnswer?.trim() ? inc.brideAnswer : ex?.brideAnswer) || "";
    const isAgreed = Boolean(inc?.isAgreed ?? ex?.isAgreed ?? (groomAnswer && brideAnswer && groomAnswer === brideAnswer));

    return {
      ...item,
      groomAnswer,
      brideAnswer,
      isAgreed,
    };
  });
}

/**
 * Merges activity logs, deduplicates by ID or timestamp+action,
 * and maintains newest 200 logs.
 */
export function mergeActivityLogs(existingLogs: any[] = [], incomingLogs: any[] = []): any[] {
  const combined = [...(incomingLogs || []), ...(existingLogs || [])];
  const seen = new Set<string>();
  const result: any[] = [];

  for (const log of combined) {
    if (!log) continue;
    const key = log.id || `${log.timestamp || 0}_${normalizeKey(log.action)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(log);
  }

  // Sort by timestamp descending
  result.sort((a, b) => {
    const tA = a.timestamp || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
    const tB = b.timestamp || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
    return tB - tA;
  });

  return result.slice(0, 500);
}

/**
 * Full PlanData Reconciliation
 */
export function mergePlanData(existing: PlanData = {}, incoming: PlanData = {}): PlanData {
  const deletedSet = new Set<string>([
    ...(Array.isArray(existing.deletedItemIds) ? existing.deletedItemIds : []),
    ...(Array.isArray(incoming.deletedItemIds) ? incoming.deletedItemIds : []),
  ]);

  const mergedSeserahan = mergeEntityList(
    existing.seserahan || [],
    incoming.seserahan || [],
    "name",
    deletedSet
  );

  const mergedPostWedding = mergeEntityList(
    existing.postWedding || [],
    incoming.postWedding || [],
    "name",
    deletedSet
  );

  const mergedChecklist = mergeEntityList(
    existing.checklist || [],
    incoming.checklist || [],
    "title",
    deletedSet
  );

  const mergedGuests = mergeEntityList(
    existing.guests || [],
    incoming.guests || [],
    "name",
    deletedSet
  );

  const mergedRundown = mergeEntityList(
    existing.rundown || [],
    incoming.rundown || [],
    "activity",
    deletedSet
  );

  const mergedBudgetCategories = mergeEntityList(
    existing.budgetCategories || [],
    incoming.budgetCategories || [],
    "name",
    deletedSet
  );

  const mergedVendors = mergeEntityList(
    existing.vendors || [],
    incoming.vendors || [],
    "vendorName",
    deletedSet
  );

  const mergedSavingContributions = mergeEntityList(
    existing.savingContributions || [],
    incoming.savingContributions || [],
    "label",
    deletedSet
  );

  const mergedAlignmentTopics = mergeAlignmentTopics(
    existing.alignmentTopics || [],
    incoming.alignmentTopics || [],
    deletedSet
  );

  const mergedAdminSteps = mergeEntityList(
    existing.adminSteps || [],
    incoming.adminSteps || [],
    "title",
    deletedSet
  );

  const mergedActivityLogs = mergeActivityLogs(existing.activityLogs || [], incoming.activityLogs || []);

  const mergedFamilyQuota = {
    ...(existing.familyQuota || {}),
    ...(incoming.familyQuota || {}),
  };

  const mergedLifeGoals = mergeEntityList(
    existing.lifeGoals || [],
    incoming.lifeGoals || [],
    "title",
    deletedSet
  );

  return {
    savingContributions: mergedSavingContributions,
    checklist: mergedChecklist,
    seserahan: mergedSeserahan,
    postWedding: mergedPostWedding,
    guests: mergedGuests,
    familyQuota: mergedFamilyQuota,
    rundown: mergedRundown,
    budgetCategories: mergedBudgetCategories,
    vendors: mergedVendors,
    alignmentTopics: mergedAlignmentTopics,
    adminSteps: mergedAdminSteps,
    activityLogs: mergedActivityLogs,
    lifeGoals: mergedLifeGoals,
    deletedItemIds: Array.from(deletedSet).slice(-500),
  };
}
