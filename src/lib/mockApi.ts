export async function fakePaymentApi(): Promise<{ ok: true }> {
  const delayMs = Math.floor(Math.random() * 1300) + 200;
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  if (Math.random() < 0.25) {
    throw new Error("Payment gateway timeout");
  }

  return { ok: true };
}
