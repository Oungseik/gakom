export const config = {
  baseUrl: process.env.BASE_URL!,

  /** verified account which already created organization  */
  orgOwner: {
    email: process.env.ORG_OWNER_EMAIL!,
    password: process.env.ORG_OWNER_PASSW!,
  },
};
