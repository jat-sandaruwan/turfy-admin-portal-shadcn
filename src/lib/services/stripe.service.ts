import Stripe from 'stripe';

// Initialize Stripe with API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Creates a Stripe Connect Standard account for a venue
 * @param venueId - The MongoDB ID of the venue
 * @param ownerId - The MongoDB ID of the venue owner
 * @param venueName - The name of the venue
 * @param ownerEmail - The email of the venue owner
 * @returns The created Stripe account object
 */
export async function createVenueStripeAccount(
  venueId: string,
  ownerId: string,
  venueName: string,
  ownerEmail: string
): Promise<Stripe.Account> {
  try {
    const account = await stripe.accounts.create({
      type: 'standard',
      email: ownerEmail,
      business_type: 'company',
      company: {
        name: venueName,
      },
      metadata: {
        venueId,
        ownerId,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return account;
  } catch (error) {
    console.error('Error creating Stripe account:', error);
    throw error;
  }
}

/**
 * Creates a Stripe onboarding link for a venue's Connect account
 * @param accountId - The Stripe account ID
 * @param venueId - The MongoDB ID of the venue
 * @returns The created account link object
 */
export async function createStripeAccountLink(
  accountId: string,
  venueId: string
): Promise<Stripe.AccountLink> {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/venues/${venueId}`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/venues/${venueId}?onboarding=complete`,
      type: 'account_onboarding',
    });

    return accountLink;
  } catch (error) {
    console.error('Error creating Stripe account link:', error);
    throw error;
  }
}

/**
 * Gets the Stripe account details
 * @param accountId - The Stripe account ID
 * @returns The Stripe account object
 */
export async function getStripeAccount(accountId: string): Promise<Stripe.Account> {
  try {
    return await stripe.accounts.retrieve(accountId);
  } catch (error) {
    console.error('Error retrieving Stripe account:', error);
    throw error;
  }
}

export { stripe };