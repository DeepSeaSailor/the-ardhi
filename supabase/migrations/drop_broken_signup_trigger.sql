-- Disable the broken auto-profile trigger.
-- It's been causing "Database error creating new user" on every signup
-- because the trigger fires during the auth.users INSERT transaction and
-- something in its execution context (RLS, grants, or search_path) is failing.
-- The app now creates the profiles row explicitly via the service-role API
-- right after auth.users creation succeeds, which is more reliable and
-- gives us proper error visibility if it ever fails again.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Function left in place (harmless, unused) in case you want to re-enable
-- later after debugging — just re-run:
-- CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
