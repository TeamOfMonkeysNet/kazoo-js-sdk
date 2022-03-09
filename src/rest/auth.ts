import { BehaviorSubject } from "rxjs";
import { AuthInformation } from "../types/auth.types";

export const auth$ = new BehaviorSubject<AuthInformation>({
  credentials: null,
  authToken: null,
  userId: null,
  accountId: null,
  accountName: null,
  currentAccountId: null,
  currentAccountName: null,
});
