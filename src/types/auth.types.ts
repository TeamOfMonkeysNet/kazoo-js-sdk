type SetAuthInformation = {
  credentials: string;
  authToken: string;
  userId: string;
  accountId: string;
  accountName: string;
  currentAccountId: string;
  currentAccountName: string;
};

type UnsetAuthInformation = {
  credentials: null;
  authToken: null;
  userId: null;
  accountId: null;
  accountName: null;
  currentAccountId: null;
  currentAccountName: null;
};

export type AuthInformation = SetAuthInformation | UnsetAuthInformation;

export type RequestOptions = {
  accountId?: string;
  userId?: string;
};
