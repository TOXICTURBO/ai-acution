import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function MyBids() {
  const { data: bids, isLoading } = useQuery({
    queryKey: ["/api/bids/my-bids"],
  });
  
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Filter bids by auction status
  const activeBids = bids ? bids.filter((bid: any) => bid.auction.status === "active") : [];
  const completedBids = bids ? bids.filter((bid: any) => bid.auction.status === "completed") : [];

  // Check if user's bid is the highest for an auction
  const isHighestBid = (bid: any) => {
    return bid.auction.currentWinnerId === bid.userId;
  };

  // Calculate time left in auction
  const getTimeLeft = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    
    if (end <= now) {
      return "Ended";
    }
    
    return formatDistanceToNow(end, { addSuffix: true });
  };

  const handlePlaceNewBid = async (auctionId: number) => {
    window.location.href = `/live-auctions?auction=${auctionId}`;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Bids</h1>
          <p className="text-gray-600 mt-1">
            Track all your active and past bids
          </p>
        </div>
      </div>

      <Tabs defaultValue="active" className="mb-8">
        <TabsList>
          <TabsTrigger value="active">
            Active Bids 
            {activeBids.length > 0 && (
              <Badge variant="secondary" className="ml-2">{activeBids.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed Bids</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="pt-4">
          {activeBids.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeBids.map((bid: any) => (
                <Card key={bid.id} className={isHighestBid(bid) ? "border-green-500" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{bid.player.username}</CardTitle>
                      {isHighestBid(bid) ? (
                        <Badge className="bg-green-500">Highest Bid</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600">Outbid</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{bid.player.specialty}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Your Bid:</span>
                        <span className="font-medium">${bid.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current Highest:</span>
                        <span className="font-medium">${bid.auction.currentPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Time Left:</span>
                        <span className="text-sm text-accent-600 font-medium">
                          {getTimeLeft(bid.auction.endTime)}
                        </span>
                      </div>
                      
                      <div className="pt-4 flex justify-center">
                        {isHighestBid(bid) ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            Leading Bid
                          </Badge>
                        ) : (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handlePlaceNewBid(bid.auction.id)}
                          >
                            Place New Bid
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center">
              <h3 className="text-lg font-medium">No active bids</h3>
              <p className="mt-2 text-gray-600">
                You don't have any active bids at the moment.
              </p>
              <Button 
                className="mt-4"
                onClick={() => window.location.href = "/live-auctions"}
              >
                Browse Live Auctions
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="pt-4">
          {completedBids.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Your Bid
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Winning Bid
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {completedBids.map((bid: any) => {
                      const won = bid.auction.currentWinnerId === bid.userId;
                      return (
                        <tr key={bid.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <img
                                src={bid.player.imageUrl}
                                alt={bid.player.username}
                                className="h-10 w-10 rounded-full"
                              />
                              <div>
                                <p className="font-medium">{bid.player.username}</p>
                                <p className="text-sm text-gray-500">{bid.player.specialty}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(bid.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            ${bid.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            ${bid.auction.currentPrice.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              won
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {won ? "Won" : "Lost"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center">
              <h3 className="text-lg font-medium">No completed bids</h3>
              <p className="mt-2 text-gray-600">
                You haven't participated in any completed auctions yet.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
