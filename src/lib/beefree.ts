export const getBeefreeCredentials = () => {
  const clientId = process.env.NEXT_PUBLIC_BEEFREE_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_BEEFREE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('NEXT_PUBLIC_BEEFREE_CLIENT_ID and NEXT_PUBLIC_BEEFREE_CLIENT_SECRET must be set in environment variables');
  }

  return { clientId, clientSecret };
};
