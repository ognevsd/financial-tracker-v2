interface Currency {
  id?: string;
  code: string;
  name: string;
  decimals: number;
}

export async function addCurrency(
  code: string,
  name: string,
  decimals: number,
): Promise<Currency> {
  const resp = await fetch("/api/currency", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: code,
      name: name,
      decimals: Number(decimals),
    }),
  });

  if (!resp.ok) {
    throw new Error("Network response not ok.");
  }

  return resp.json();
}
