export default function Checkout() {
  async function handleCheckout() {
    const res = await fetch(
      "http://localhost:3000/stripe/create-checkout-session",
      {
        method: "POST",
      },
    );

    const { url } = await res.json();

    window.location.href = url;
  }

  return <button onClick={handleCheckout}>Buy Now</button>;
}
