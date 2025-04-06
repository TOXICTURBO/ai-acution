import { useState, useContext } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { UserContext } from "../App";

interface Auction {
  id: number;
  currentPrice: number;
  player: {
    username: string;
    realName: string;
    specialty: string;
    imageUrl: string;
  };
}

interface BidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  auction: Auction;
  minBid: number;
}

export default function BidDialog({ isOpen, onClose, auction, minBid }: BidDialogProps) {
  const [bidAmount, setBidAmount] = useState(minBid);
  const { toast } = useToast();
  const { user } = useContext(UserContext);

  const bidMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await apiRequest('POST', '/api/bids', {
          auctionId: auction.id,
          amount: bidAmount
        });
        return await response.json();
      } catch (error: any) {
        console.error('API request error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auctions/live'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bids/my-bids'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: 'Bid placed successfully',
        description: `You have placed a bid of $${bidAmount.toLocaleString()} on ${auction.player.username}`,
      });
      onClose();
    },
    onError: (error: any) => {
      console.error('Bid error:', error);
      toast({
        title: 'Failed to place bid',
        description: error.message || 'An error occurred while placing your bid',
        variant: 'destructive',
      });
    }
  });

  const placeBid = () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to place a bid",
        variant: "destructive",
      });
      onClose();
      return;
    }
    
    if (bidAmount < minBid) {
      toast({
        title: "Bid too low",
        description: `Your bid must be at least $${minBid.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }
    
    if (bidAmount > (user.balance || 0)) {
      toast({
        title: "Insufficient funds",
        description: "Your bid exceeds your available balance",
        variant: "destructive",
      });
      return;
    }
    
    bidMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border border-card-border" style={{ background: 'rgba(0, 15, 15, 0.95)' }} aria-describedby="bid-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-neon-cyan text-center font-bold glow-text">Place a Bid</DialogTitle>
        </DialogHeader>
        <p id="bid-dialog-description" className="sr-only">Dialog to place a bid on a player in the auction</p>
        
        <div className="flex items-center space-x-4 my-4">
          <div className="h-16 w-16 rounded-full overflow-hidden border border-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.2)]">
            <img
              src={auction.player.imageUrl}
              alt={auction.player.username}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-light-cyan">{auction.player.username}</h3>
            <p className="text-sm text-neon-cyan/80">{auction.player.realName}</p>
            <p className="text-xs text-neon-cyan/60">{auction.player.specialty}</p>
          </div>
        </div>
        
        <div className="grid gap-4 py-4 border-y border-card-border">
          <div className="flex justify-between text-sm">
            <span className="text-light-cyan/70">Current Bid:</span>
            <span className="font-medium text-light-cyan">${auction.currentPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-light-cyan/70">Minimum Bid:</span>
            <span className="font-medium text-light-cyan">${minBid.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-light-cyan/70">Your Balance:</span>
            <span className="font-medium text-neon-cyan">${(user?.balance || 0).toLocaleString()}</span>
          </div>
          
          <div className="mt-2">
            <Label htmlFor="bid-amount" className="text-light-cyan">Your Bid</Label>
            <Input
              id="bid-amount"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              min={minBid}
              max={user?.balance || 0}
              className="mt-1"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={bidMutation.isPending}
            className="border-card-border text-light-cyan hover:bg-dark-teal/50 hover:text-neon-cyan"
          >
            Cancel
          </Button>
          <Button 
            onClick={placeBid} 
            disabled={bidMutation.isPending || bidAmount < minBid || bidAmount > (user?.balance || 0)}
            className="cyber-btn"
          >
            {bidMutation.isPending ? "Processing..." : "Place Bid"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
