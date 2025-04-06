import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AuctionRules() {
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Auction Rules</h1>
          <p className="text-gray-600 mt-1">
            Learn how the player auction system works
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Each team leader starts with a balance of $25,000 that can be used to bid on players.
              Build your team by winning auctions for players who will best complement your strategy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Team Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Teams can have a maximum of 12 players. You'll need a mix of different player specialties
              to create a well-balanced team that can compete effectively.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Season Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              The auction season runs for 3 months. Players acquired during this period will represent
              your team for the entire competitive season that follows.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Auction Rules & Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="bidding">
                  <AccordionTrigger>Bidding Process</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      When placing bids on players, the following rules apply:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>All bids must be at least 5% higher than the current highest bid</li>
                      <li>Once placed, bids cannot be retracted</li>
                      <li>Auction timers may be extended by 5 minutes if a bid is placed in the final 3 minutes</li>
                      <li>Your funds are not deducted until you win an auction</li>
                      <li>You can bid on multiple auctions simultaneously if you have sufficient funds</li>
                      <li>If outbid, you'll receive a notification and can place a new bid</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="winning">
                  <AccordionTrigger>Winning Auctions</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      When you win an auction:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>The bid amount is immediately deducted from your balance</li>
                      <li>The player is added to your team roster</li>
                      <li>The player cannot be transferred to another team for 14 days</li>
                      <li>You can access detailed player statistics and performance metrics</li>
                      <li>Players require a 48-hour integration period before they can participate in tournaments</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="payment">
                  <AccordionTrigger>Payment & Transactions</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      Financial aspects of the auction system:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Additional funds can be added to your balance at any time</li>
                      <li>All transactions are final and non-refundable</li>
                      <li>A 2% transaction fee applies to all winning bids</li>
                      <li>Seasonal bonuses may be awarded based on team performance</li>
                      <li>Unused funds roll over to the next auction season</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="players">
                  <AccordionTrigger>Player Categories</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      Players are categorized based on their specialties:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li><strong>FPS Expert:</strong> Specializes in first-person shooter games with high accuracy and reaction time</li>
                      <li><strong>MOBA Captain:</strong> Excels in multiplayer online battle arena games with strong leadership and team coordination</li>
                      <li><strong>Battle Royale:</strong> Skilled in survival and combat strategies for last-player-standing formats</li>
                      <li><strong>RTS:</strong> Strategic planning and resource management for real-time strategy games</li>
                      <li><strong>Team Captain:</strong> Enhanced leadership abilities that boost overall team performance</li>
                      <li><strong>Support:</strong> Specializes in team-oriented assistance roles</li>
                      <li><strong>DPS:</strong> Focus on maximizing damage output in competitive settings</li>
                      <li><strong>Flanker:</strong> Excels at tactical positioning and surprise maneuvers</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="disputes">
                  <AccordionTrigger>Dispute Resolution</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      If you encounter issues during the auction process:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>All disputes must be submitted within 24 hours of the auction ending</li>
                      <li>Technical issues affecting bid placement will be reviewed by admins</li>
                      <li>Decisions made by the auction administrators are final</li>
                      <li>Evidence of attempted manipulation of the auction system will result in penalties</li>
                      <li>Contact support@gamedraft.com for any auction-related concerns</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm">Auction Season Start</h3>
                  <p className="text-sm text-gray-600">June 1, 2023</p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium text-sm">Mid-Season Transfer Window</h3>
                  <p className="text-sm text-gray-600">July 15-22, 2023</p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium text-sm">Auction Season End</h3>
                  <p className="text-sm text-gray-600">August 31, 2023</p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium text-sm">Competitive Season Start</h3>
                  <p className="text-sm text-gray-600">September 15, 2023</p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium text-sm">Championship Finals</h3>
                  <p className="text-sm text-gray-600">December 10-12, 2023</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Rules are subject to change. Last updated: May 25, 2023
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
