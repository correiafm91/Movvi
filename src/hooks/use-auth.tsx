
import { useUser } from "./use-user";

// A simple wrapper around useUser to make component migration easier
export function useAuth() {
  return useUser();
}
