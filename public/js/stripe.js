import axios from 'axios';

const stripe = Stripe(
  'pk_test_51LCGjjSF6JVrdN2LvSo0TaBeH7kz169qe9YqXn8472ewNgyGXUPxWDlr23ZTpN7VoKKWRFgvcdrl01VDz7aHKlNI00HUJio4pt'
);

export const bookResto = async (restoId) => {
  // 1.. Get checkout session from Api
  try {
    const session = await axios({
      method: 'GET',
      url: `/api/v1/bookings/checkout-session/${restoId}`,
    });
    // console.log(session);

    //2.. create checkout form + charge card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
  }
};
