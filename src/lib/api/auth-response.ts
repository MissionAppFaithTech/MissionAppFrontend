export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role?: 'ADMIN' | 'MISSIONARY' | 'SUPPORTER';
};

export type AuthTokensResponse = {
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
};
