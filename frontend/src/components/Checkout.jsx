export default function Checkout() {
  async function handleCheckout() {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/stripe/create-checkout-session`,
      {
        method: "POST",
      },
    );

    const { url } = await res.json();

    window.location.href = url;
  }

  return <button onClick={handleCheckout}>Buy Now</button>;
}
