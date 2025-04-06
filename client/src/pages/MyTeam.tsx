import { useQuery } from "@tanstack/react-query";
import TeamTable from "@/components/TeamTable";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

export default function MyTeam() {
  const { data: team, isLoading } = useQuery({
    queryKey: ["/api/teams/my-team"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate team statistics
  const calculateStats = () => {
    if (!team || team.length === 0) {
      return {
        averageLevel: 0,
        averageExperience: 0,
        averageWinRate: 0,
        specialtyCounts: {},
        primaryStrength: "N/A",
        weakness: "N/A",
      };
    }

    const totalLevel = team.reduce((sum: number, player: any) => sum + player.level, 0);
    const totalExperience = team.reduce((sum: number, player: any) => sum + player.experience, 0);
    const totalWinRate = team.reduce((sum: number, player: any) => sum + player.winRate, 0);

    // Count specialties
    const specialtyCounts: Record<string, number> = {};
    team.forEach((player: any) => {
      if (specialtyCounts[player.specialty]) {
        specialtyCounts[player.specialty]++;
      } else {
        specialtyCounts[player.specialty] = 1;
      }
    });

    // Determine primary strength based on highest average stat
    const stats = [
      { name: "Accuracy", value: getAverageStat(team, "accuracy") },
      { name: "Reaction Time", value: getAverageStat(team, "reactionTime") },
      { name: "Strategy", value: getAverageStat(team, "strategy") },
      { name: "Leadership", value: getAverageStat(team, "leadership") },
      { name: "Team Coordination", value: getAverageStat(team, "teamCoordination") },
      { name: "Combat", value: getAverageStat(team, "combat") },
    ].filter(stat => stat.value > 0);

    const primaryStrength = stats.length > 0 
      ? stats.reduce((prev, current) => prev.value > current.value ? prev : current).name 
      : "N/A";
    
    const weakness = stats.length > 0 
      ? stats.reduce((prev, current) => prev.value < current.value ? prev : current).name 
      : "N/A";

    return {
      averageLevel: Math.round(totalLevel / team.length),
      averageExperience: +(totalExperience / team.length).toFixed(1),
      averageWinRate: Math.round(totalWinRate / team.length),
      specialtyCounts,
      primaryStrength,
      weakness,
    };
  };

  // Helper to get average value of a specific stat
  const getAverageStat = (team: any[], statName: string) => {
    const playersWithStat = team.filter((player: any) => player[statName]);
    if (playersWithStat.length === 0) return 0;
    
    const total = playersWithStat.reduce((sum: number, player: any) => sum + player[statName], 0);
    return Math.round(total / playersWithStat.length);
  };

  const teamStats = calculateStats();

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Team</h1>
          <p className="text-gray-600 mt-1">
            Manage your roster and view team performance
          </p>
        </div>
      </div>

      <Tabs defaultValue="roster" className="mb-8">
        <TabsList>
          <TabsTrigger value="roster">Team Roster</TabsTrigger>
          <TabsTrigger value="analytics">Team Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="roster" className="pt-4">
          <TeamTable />
        </TabsContent>
        <TabsContent value="analytics" className="pt-4">
          {team && team.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Team Overview</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Average Level</span>
                        <span className="text-sm font-medium">{teamStats.averageLevel}</span>
                      </div>
                      <Progress value={teamStats.averageLevel} max={100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Average Experience</span>
                        <span className="text-sm font-medium">{teamStats.averageExperience} years</span>
                      </div>
                      <Progress value={teamStats.averageExperience * 10} max={50} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Win Rate</span>
                        <span className="text-sm font-medium">{teamStats.averageWinRate}%</span>
                      </div>
                      <Progress value={teamStats.averageWinRate} max={100} className="h-2" />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Team Composition</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(teamStats.specialtyCounts).map(([specialty, count]) => (
                        <div 
                          key={specialty} 
                          className="bg-gray-100 p-2 rounded-md flex justify-between items-center"
                        >
                          <span className="text-xs">{specialty}</span>
                          <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Strengths & Weaknesses</h3>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2">Primary Strength</h4>
                    <div className="bg-green-100 p-3 rounded-md">
                      <div className="font-medium text-green-800">{teamStats.primaryStrength}</div>
                      <p className="text-xs text-green-700 mt-1">
                        Your team excels in this area compared to others.
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2">Area for Improvement</h4>
                    <div className="bg-amber-100 p-3 rounded-md">
                      <div className="font-medium text-amber-800">{teamStats.weakness}</div>
                      <p className="text-xs text-amber-700 mt-1">
                        Consider adding players who are strong in this area.
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Recommended Player Types</h4>
                    <ul className="text-sm space-y-2">
                      {teamStats.weakness === "Accuracy" && (
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-primary-500 mr-2"></div>
                          FPS Expert with high accuracy rating
                        </li>
                      )}
                      {teamStats.weakness === "Team Coordination" && (
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-primary-500 mr-2"></div>
                          MOBA Captain with team coordination skills
                        </li>
                      )}
                      {teamStats.weakness === "Strategy" && (
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-primary-500 mr-2"></div>
                          RTS specialist with strategic planning
                        </li>
                      )}
                      {teamStats.weakness === "Combat" && (
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-primary-500 mr-2"></div>
                          Battle Royale expert with combat experience
                        </li>
                      )}
                      <li className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary-500 mr-2"></div>
                        Players with 3+ years of experience
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center">
              <h3 className="text-lg font-medium">No team data available</h3>
              <p className="mt-2 text-gray-600">
                Add players to your team to see analytics.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
