import { useQuery } from "@tanstack/react-query";
import { getAllAssets } from "../api/asset";
import { useNavigate } from "@tanstack/react-router";

export default function AssetTable() {
  const { data, isLoading } = useQuery({
    queryFn: getAllAssets,
    queryKey: ["all-assets"],
    staleTime: 120_000,
  });
  const navigate = useNavigate({ from: "/companies" });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data?.asset === null) {
    return <div>No assets in DB</div>;
  }

  const handleRowClick = (companyId: string) => {
    navigate({
      to: "/companies/$companyId",
      params: { companyId },
    });
  };

  return (
    <table className="w-full">
      <thead className="bg-gray-200 text-left">
        <tr>
          <th className="px-4 py-2">Ticker</th>
          <th className="px-4 py-2">Company Name</th>
          <th className="px-4 py-2">Industry</th>
        </tr>
      </thead>
      <tbody>
        {data?.asset.map((asset, index) => (
          <tr
            key={asset.id}
            className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:cursor-pointer hover:bg-gray-200`}
            onClick={() => handleRowClick(asset.id)}
          >
            <td className="px-4 py-2">{asset.ticker}</td>
            <td className="px-4 py-2">{asset.name}</td>
            <td className="px-4 py-2">{asset.industry}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
