import { useQuery } from "@tanstack/react-query";

interface AuctionHistoryItem {
  id: number;
  playerId: number;
  currentPrice: number;
  endTime: string;
  player: {
    id: number;
    username: string;
    realName: string;
    specialty: string;
    imageUrl: string;
  };
  winner: {
    id: number;
    username: string;
    teamName: string;
  } | null;
  currentWinnerId: number;
}

export default function AuctionHistory() {
  const { data: history, isLoading } = useQuery({
    queryKey: ["/api/auctions/history"],
  });

  const { data: myBids } = useQuery({
    queryKey: ["/api/bids/my-bids"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="rounded-xl p-8 border border-card-border text-center" style={{ background: 'rgba(0, 15, 15, 0.6)' }}>
        <h3 className="text-lg font-medium text-light-cyan">No auction history yet</h3>
        <p className="mt-2 text-neon-cyan/70">
          Once auctions are completed, you'll see the history here.
        </p>
      </div>
    );
  }

  // Get my recent bid amounts for each auction
  const getMyBidAmount = (auctionId: number) => {
    if (!myBids) return null;
    
    const bidsForAuction = myBids.filter((bid: any) => bid.auctionId === auctionId);
    if (bidsForAuction.length === 0) return null;
    
    // Get highest bid amount
    return Math.max(...bidsForAuction.map((bid: any) => bid.amount));
  };

  const getTeamInitial = (teamName: string) => {
    return teamName.charAt(0);
  };

  const getTeamColor = (teamName: string) => {
    const colors = [
      "bg-red-700",
      "bg-blue-700",
      "bg-green-700",
      "bg-purple-700",
      "bg-amber-700",
      "bg-fuchsia-700",
      "bg-indigo-700",
    ];
    
    // Simple hash function to get consistent color
    let hash = 0;
    for (let i = 0; i < teamName.length; i++) {
      hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="rounded-xl border border-card-border overflow-hidden" style={{ background: 'rgba(0, 15, 15, 0.6)' }}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-card-border">
          <thead>
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neon-cyan uppercase tracking-wider">
                Player
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neon-cyan uppercase tracking-wider">
                Auction Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neon-cyan uppercase tracking-wider">
                Winning Bid
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neon-cyan uppercase tracking-wider">
                Winning Team
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neon-cyan uppercase tracking-wider">
                Your Bid
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neon-cyan uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {history.map((item: AuctionHistoryItem) => {
              const myBidAmount = getMyBidAmount(item.id);
              const didWin = myBidAmount === item.currentPrice;
              
              return (
                <tr key={item.id} className="hover:bg-dark-teal/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden border border-neon-cyan/30">
                        <img
                          src={item.player.imageUrl}
                          alt={item.player.username}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-light-cyan">{item.player.username}</p>
                        <p className="text-sm text-neon-cyan/70">
                          {item.player.specialty}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neon-cyan/70">
                    {new Date(item.endTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neon-cyan">
                      ${item.currentPrice.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.winner && (
                      <div className="flex items-center space-x-2">
                        <div className={`h-6 w-6 ${getTeamColor(item.winner.teamName)} bg-opacity-70 rounded-full flex items-center justify-center text-white text-xs font-bold border border-card-border`}>
                          {getTeamInitial(item.winner.teamName)}
                        </div>
                        <span className="text-sm text-light-cyan">{item.winner.teamName}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {myBidAmount ? (
                      <span className="text-sm font-medium text-light-cyan">
                        ${myBidAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-sm text-neon-cyan/40">No bid</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {myBidAmount ? (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        didWin
                          ? "bg-green-900/50 text-green-300 border border-green-600"
                          : "bg-red-900/50 text-red-300 border border-red-600"
                      }`}>
                        {didWin ? "Won" : "Outbid"}
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-900/50 text-gray-300 border border-gray-600">
                        No bid
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
