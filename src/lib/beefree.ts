export const getBeefreeCredentials = () => {
  const clientId = process.env.BEEFREE_CLIENT_ID;
  const clientSecret = process.env.BEEFREE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('BEEFREE_CLIENT_ID and BEEFREE_CLIENT_SECRET must be set in environment variables');
  }

  return { clientId, clientSecret };
};
