const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('YOUR_SUPABASE')
);

// Lightweight zero-dependency Supabase REST Client
export const createSupabaseClient = (url, key) => {
  if (!isSupabaseConfigured) return null;

  return {
    auth: {
      signUp: async ({ email, password, options }) => {
        try {
          const res = await fetch(`${url}/auth/v1/signup`, {
            method: 'POST',
            headers: { 'apikey': key, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, data: options?.data })
          });
          const data = await res.json();
          return { data: res.ok ? data : null, error: res.ok ? null : data };
        } catch (e) {
          return { data: null, error: { message: e.message } };
        }
      },
      signInWithPassword: async ({ email, password }) => {
        try {
          const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: { 'apikey': key, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json();
          return { data: res.ok ? data : null, error: res.ok ? null : data };
        } catch (e) {
          return { data: null, error: { message: e.message } };
        }
      },
      signOut: async () => {
        return { error: null };
      },
      getSession: async () => {
        return { data: { session: null }, error: null };
      },
      onAuthStateChange: () => {
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      resetPasswordForEmail: async (email) => {
        try {
          const res = await fetch(`${url}/auth/v1/recover`, {
            method: 'POST',
            headers: { 'apikey': key, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await res.json();
          return { data: res.ok ? data : {}, error: res.ok ? null : data };
        } catch (e) {
          return { data: null, error: { message: e.message } };
        }
      }
    },
    from: (tableName) => ({
      select: async () => {
        try {
          const res = await fetch(`${url}/rest/v1/${tableName}?select=*`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
          });
          const data = await res.json();
          return { data: res.ok ? data : [], error: res.ok ? null : data };
        } catch (e) {
          return { data: [], error: { message: e.message } };
        }
      },
      insert: async (records) => {
        try {
          const res = await fetch(`${url}/rest/v1/${tableName}`, {
            method: 'POST',
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
            body: JSON.stringify(records)
          });
          const data = await res.json();
          return { data: res.ok ? data : null, error: res.ok ? null : data };
        } catch (e) {
          return { data: null, error: { message: e.message } };
        }
      }
    })
  };
};

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
