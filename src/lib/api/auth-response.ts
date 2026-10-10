export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
};

export type AuthTokensResponse = {
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
};
