import { useQuery } from "@tanstack/react-query";
import { getAllCurrencies } from "../api/currency";

export default function CurrencyTable() {
  const { isLoading, data } = useQuery({
    queryKey: ["all-currencies"],
    queryFn: () => getAllCurrencies(),
    staleTime: 30000,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <table className="overflow-hidden">
      <thead className="bg-gray-200">
        <tr>
          <th className="px-4 py-2">Code</th>
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Decimals</th>
        </tr>
      </thead>
      <tbody>
        {data?.map((row, index) => (
          <tr
            key={row.id}
            className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
          >
            <td className="px-4 py-2">{row.code}</td>
            <td className="px-4 py-2">{row.name}</td>
            <td className="px-4 py-2">{row.decimals}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
