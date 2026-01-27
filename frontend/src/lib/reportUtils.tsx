export type Year = number;

export interface Field {
  id: string;
  name: string;
  values: Record<Year, number>;
}

export interface Section {
  id: string;
  name: string;
  sections: Section[];
  fields: Field[];
}

export interface Report {
  years: Year[];
  sections: Section[];
}

export const defaultData: Report = {
  years: [2024, 2023],
  sections: [
    {
      id: "totalassets",
      name: "Total Assets",
      sections: [
        {
          id: "currentassets",
          name: "Current Assets",
          sections: [],
          fields: [
            {
              id: "reinvest",
              name: "Real estate investments",
              values: {
                2024: 4513734,
                2023: 4617261,
              },
            },
            {
              id: "loans",
              name: "Loans receivable and other investments",
              values: {
                2024: 442584,
                2023: 420624,
              },
            },
            {
              id: "investimentinunconsolidated",
              name: "Investment in unconsolidated joint ventures",
              values: {
                2024: 121803,
                2023: 136843,
              },
            },
          ],
        },
        {
          id: "noncurrentassets",
          name: "Non-Current Assets",
          sections: [],
          fields: [
            {
              id: "cash",
              name: "Cash and cash equivalents",
              values: {
                2024: 60468,
                2023: 41285,
              },
            },
            {
              id: "restrinctedcash",
              name: "Restricted cash",
              values: {
                2024: 5871,
                2023: 5434,
              },
            },
          ],
        },
      ],
      fields: [],
    },
    {
      id: "totallian",
      name: "Total Liabilities",
      sections: [
        {
          id: "currentlia",
          name: "Current Liabilities",
          sections: [],
          fields: [
            {
              id: "secureddebt",
              name: "Secured debt, net",
              values: {
                2024: 45316,
                2023: 47301,
              },
            },
          ],
        },
        {
          id: "NCL",
          name: "Non-Current Liabilities",
          sections: [],
          fields: [],
        },
      ],
      fields: [],
    },
  ],
};

export function formatCurrency(n: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    currencySign: "accounting",
    maximumFractionDigits: 0,
  }).format(n);
}

export function sumSectionByYear(
  section: Section,
  years: Year[],
): Record<Year, number> {
  const totals = Object.fromEntries(years.map((y) => [y, 0]));

  for (const f of section.fields) {
    for (const y of years) {
      totals[y] += f.values[y] ?? 0;
    }
  }

  for (const child of section.sections) {
    const childTotals = sumSectionByYear(child, years);
    for (const y of years) {
      totals[y] += childTotals[y] ?? 0;
    }
  }

  return totals;
}
