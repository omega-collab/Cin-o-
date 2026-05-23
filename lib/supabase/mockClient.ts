// Mock Supabase client used as a fallback in dev when NEXT_PUBLIC_SUPABASE_URL
// is absent. NOT used in production (the real client is created when env vars
// are present). Enables local UI development and end-to-end testing without a
// Supabase backend — auth returns a fixed mock user, REST tables live in
// memory, realtime is a no-op.
//
// Detection happens in client.ts. To force this mock with real env vars set,
// use NEXT_PUBLIC_SUPABASE_URL="" or delete it from .env.local.

type Listener = (event: string, session: unknown) => void;

const MOCK_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "[email protected]",
  user_metadata: { display_name: "Démo Utilisateur", initials: "DU" },
  app_metadata: { provider: "email" },
  aud: "authenticated",
  role: "authenticated",
  created_at: new Date().toISOString(),
};

const MOCK_SESSION = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
  user: MOCK_USER,
};

const MOCK_PROJECT = {
  id: "00000000-0000-0000-0000-000000000010",
  name: "Tournage de démo",
  invite_code: "DEMO42",
  owner_id: MOCK_USER.id,
  created_at: new Date().toISOString(),
};

const MOCK_PROFILE = {
  id: MOCK_USER.id,
  display_name: "Démo Utilisateur",
  initials: "DU",
  department: "camera",
  role: "3e assistant caméra",
  avatar_id: null,
  created_at: new Date().toISOString(),
};

// In-memory tables, keyed by table name.
const tables: Record<string, Record<string, unknown>[]> = {
  profiles: [MOCK_PROFILE],
  projects: [MOCK_PROJECT],
  project_members: [
    { project_id: MOCK_PROJECT.id, user_id: MOCK_USER.id, role: "owner", joined_at: new Date().toISOString() },
  ],
  project_data: [],
  frais_entries: [],
};

const listeners: Listener[] = [];

// ── from() chainable query builder ────────────────────────────────────────────
function fromBuilder(table: string) {
  let filters: Array<{ col: string; op: string; val: unknown }> = [];
  let pendingInsert: Record<string, unknown>[] | null = null;
  let pendingUpdate: Record<string, unknown> | null = null;
  let pendingUpsert: Record<string, unknown>[] | null = null;
  let isDelete = false;
  let isSingle = false;
  let isMaybeSingle = false;
  let selectFields = "*";
  let orderCol: { col: string; ascending: boolean } | null = null;

  function applyFilters(rows: Record<string, unknown>[]) {
    return rows.filter((row) =>
      filters.every((f) => {
        const cell = row[f.col];
        if (f.op === "eq") return cell === f.val;
        return true;
      })
    );
  }

  const builder: Record<string, unknown> = {
    select(fields = "*") { selectFields = fields; return builder; },
    insert(rows: Record<string, unknown> | Record<string, unknown>[]) {
      pendingInsert = Array.isArray(rows) ? rows : [rows];
      return builder;
    },
    update(patch: Record<string, unknown>) { pendingUpdate = patch; return builder; },
    upsert(rows: Record<string, unknown> | Record<string, unknown>[]) {
      pendingUpsert = Array.isArray(rows) ? rows : [rows];
      return builder;
    },
    delete() { isDelete = true; return builder; },
    eq(col: string, val: unknown) { filters.push({ col, op: "eq", val }); return builder; },
    order(col: string, opts?: { ascending?: boolean }) {
      orderCol = { col, ascending: opts?.ascending ?? true };
      return builder;
    },
    single() { isSingle = true; return builder; },
    maybeSingle() { isMaybeSingle = true; return builder; },

    // Awaiting the builder executes the query.
    then(onFulfilled: (v: { data: unknown; error: unknown }) => unknown) {
      const result = exec();
      return Promise.resolve(result).then(onFulfilled);
    },
  };

  function exec(): { data: unknown; error: unknown } {
    const rows = (tables[table] ??= []);

    if (pendingInsert) {
      rows.push(...pendingInsert);
      const out = pendingInsert;
      pendingInsert = null;
      return { data: isSingle ? out[0] : out, error: null };
    }
    if (pendingUpsert) {
      // Naive upsert: replace by id if present, else insert.
      for (const r of pendingUpsert) {
        const idx = rows.findIndex((x) => (x as { id?: unknown }).id === (r as { id?: unknown }).id);
        if (idx >= 0) rows[idx] = { ...rows[idx], ...r };
        else rows.push(r);
      }
      const out = pendingUpsert;
      pendingUpsert = null;
      return { data: isSingle ? out[0] : out, error: null };
    }
    if (pendingUpdate) {
      const matched = applyFilters(rows);
      for (const row of matched) Object.assign(row, pendingUpdate);
      pendingUpdate = null;
      return { data: isSingle ? matched[0] ?? null : matched, error: null };
    }
    if (isDelete) {
      const matched = applyFilters(rows);
      const remaining = rows.filter((r) => !matched.includes(r));
      tables[table] = remaining;
      return { data: matched, error: null };
    }

    // Plain select
    let data = applyFilters(rows);
    if (orderCol) {
      data = [...data].sort((a, b) => {
        const av = a[orderCol!.col] as string;
        const bv = b[orderCol!.col] as string;
        return orderCol!.ascending ? (av > bv ? 1 : -1) : (av > bv ? -1 : 1);
      });
    }

    // The project_members.select includes "projects(*)" — emulate the join.
    if (table === "project_members" && selectFields.includes("projects")) {
      const projects = tables.projects ?? [];
      data = data.map((r) => ({
        ...r,
        projects: projects.find((p) => (p as { id: string }).id === (r as { project_id: string }).project_id) ?? null,
      }));
    }

    if (isSingle) return { data: data[0] ?? null, error: data.length === 0 ? { message: "No rows" } : null };
    if (isMaybeSingle) return { data: data[0] ?? null, error: null };
    return { data, error: null };
  }

  return builder;
}

// ── Public mock client ────────────────────────────────────────────────────────
export function createMockClient() {
  return {
    auth: {
      async getSession() {
        return { data: { session: MOCK_SESSION }, error: null };
      },
      async getUser() {
        return { data: { user: MOCK_USER }, error: null };
      },
      onAuthStateChange(cb: Listener) {
        listeners.push(cb);
        // Fire immediately to populate the store.
        setTimeout(() => cb("INITIAL_SESSION", MOCK_SESSION), 0);
        return {
          data: {
            subscription: {
              unsubscribe() {
                const i = listeners.indexOf(cb);
                if (i >= 0) listeners.splice(i, 1);
              },
            },
          },
        };
      },
      async signInWithPassword() {
        return { data: { user: MOCK_USER, session: MOCK_SESSION }, error: null };
      },
      async signUp() {
        return { data: { user: MOCK_USER, session: MOCK_SESSION }, error: null };
      },
      async signOut() {
        return { error: null };
      },
      async resetPasswordForEmail() {
        return { data: {}, error: null };
      },
    },
    from(table: string) {
      return fromBuilder(table);
    },
    channel(_name: string) {
      return {
        on() { return this; },
        subscribe() { return this; },
      };
    },
    removeChannel() {
      return Promise.resolve();
    },
    storage: {
      from(_bucket: string) {
        return {
          async upload() { return { data: { path: "mock-upload" }, error: null }; },
          getPublicUrl(path: string) { return { data: { publicUrl: `https://mock.storage/${path}` } }; },
        };
      },
    },
  };
}
