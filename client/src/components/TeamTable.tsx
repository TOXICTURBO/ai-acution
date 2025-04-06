import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TeamTable() {
  const { data: players, isLoading } = useQuery({
    queryKey: ["/api/teams/my-team"],
  });
  
  const [isReleaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const { toast } = useToast();
  
  const releaseMutation = useMutation({
    mutationFn: async (playerId: number) => {
      const response = await apiRequest("POST", `/api/players/${playerId}/release`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams/my-team"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/dashboard"] });
      toast({
        title: "Player released",
        description: "The player has been released successfully",
      });
      setReleaseDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to release player",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!players || (players && players.length === 0)) {
    return (
      <div className="rounded-xl p-8 border border-card-border text-center" style={{ background: 'rgba(0, 15, 15, 0.6)' }}>
        <h3 className="text-lg font-medium text-light-cyan">No players in your team yet</h3>
        <p className="mt-2 text-neon-cyan/70">
          Head over to the Live Auctions to bid on players and build your team.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full rounded-xl border border-card-border">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wider">
              <th className="py-3 px-6 text-neon-cyan">Player</th>
              <th className="py-3 px-6 text-neon-cyan">Role</th>
              <th className="py-3 px-6 text-neon-cyan">Experience</th>
              <th className="py-3 px-6 text-neon-cyan">Win Rate</th>
              <th className="py-3 px-6 text-neon-cyan">Acquisition Cost</th>
              <th className="py-3 px-6 text-neon-cyan">Status</th>
              <th className="py-3 px-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {Array.isArray(players) && players.map((player: any) => (
              <tr key={player.id} className="hover:bg-dark-teal/30 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-neon-cyan/30">
                      <img
                        src={player.imageUrl}
                        alt={player.username}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-light-cyan">{player.username}</p>
                      <p className="text-sm text-neon-cyan/70">{player.realName}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={getRoleClassNames(player.specialty)}>
                    {player.specialty}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <p className="text-light-cyan">{player.experience} years</p>
                  <p className="text-sm text-neon-cyan/70">Level {player.level}</p>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <span className={getWinRateColor(player.winRate) + " font-medium mr-2"}>
                      {player.winRate}%
                    </span>
                    <div className="w-24 bg-darkest-teal rounded-full h-2 border border-card-border">
                      <div
                        className={getWinRateBarColor(player.winRate) + " h-2 rounded-full"}
                        style={{ width: `${player.winRate}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 font-medium text-neon-cyan">
                  ${(player.acquisitionCost || 0).toLocaleString()}
                </td>
                <td className="py-4 px-6">
                  <span className={getStatusClassNames(player.isActive)}>
                    {player.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button 
                    className="text-light-cyan hover:text-red-400 transition-colors"
                    onClick={() => {
                      setSelectedPlayer(player);
                      setReleaseDialogOpen(true);
                    }}
                  >
                    Release
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <AlertDialog open={isReleaseDialogOpen} onOpenChange={setReleaseDialogOpen}>
        <AlertDialogContent className="border border-card-border" style={{ background: 'rgba(0, 15, 15, 0.95)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neon-cyan text-center font-bold glow-text">Release Player</AlertDialogTitle>
            <AlertDialogDescription className="text-light-cyan">
              Are you sure you want to release <span className="text-neon-cyan font-semibold">{selectedPlayer?.username}</span>?
              This action cannot be undone and the player will be available for other teams to acquire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-darker-teal border-card-border text-light-cyan hover:bg-dark-teal/50 hover:text-neon-cyan">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedPlayer) {
                  releaseMutation.mutate(selectedPlayer.id);
                }
              }}
              disabled={releaseMutation.isPending}
              className="cyber-btn bg-red-900 hover:bg-red-800 border-red-500"
            >
              {releaseMutation.isPending ? "Releasing..." : "Release Player"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Helper functions for styling
function getRoleClassNames(role: string) {
  switch (role) {
    case "Team Captain":
      return "bg-blue-900/70 text-blue-300 border border-blue-600 text-xs font-medium px-2.5 py-0.5 rounded-full";
    case "Support":
      return "bg-purple-900/70 text-purple-300 border border-purple-600 text-xs font-medium px-2.5 py-0.5 rounded-full";
    case "DPS":
      return "bg-red-900/70 text-red-300 border border-red-600 text-xs font-medium px-2.5 py-0.5 rounded-full";
    case "Flanker":
      return "bg-green-900/70 text-green-300 border border-green-600 text-xs font-medium px-2.5 py-0.5 rounded-full";
    case "MOBA":
      return "bg-indigo-900/70 text-indigo-300 border border-indigo-600 text-xs font-medium px-2.5 py-0.5 rounded-full";
    case "FPS Expert":
      return "bg-fuchsia-900/70 text-fuchsia-300 border border-fuchsia-600 text-xs font-medium px-2.5 py-0.5 rounded-full";
    case "Battle Royale":
      return "bg-cyan-900/70 text-cyan-300 border border-cyan-600 text-xs font-medium px-2.5 py-0.5 rounded-full";
    case "RTS":
      return "bg-amber-900/70 text-amber-300 border border-amber-600 text-xs font-medium px-2.5 py-0.5 rounded-full";
    default:
      return "bg-gray-900/70 text-gray-300 border border-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full";
  }
}

function getStatusClassNames(isActive: boolean) {
  return isActive
    ? "bg-green-900/50 text-green-300 border border-green-600 text-xs font-medium px-2.5 py-0.5 rounded-full"
    : "bg-amber-900/50 text-amber-300 border border-amber-600 text-xs font-medium px-2.5 py-0.5 rounded-full";
}

function getWinRateColor(winRate: number) {
  if (winRate >= 75) return "text-green-400";
  if (winRate >= 60) return "text-green-400";
  if (winRate >= 50) return "text-amber-400";
  return "text-red-400";
}

function getWinRateBarColor(winRate: number) {
  if (winRate >= 75) return "bg-green-400";
  if (winRate >= 60) return "bg-green-400";
  if (winRate >= 50) return "bg-amber-400";
  return "bg-red-400";
}
