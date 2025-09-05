"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Target,
  Trophy,
  Dice1,
  Settings,
  BarChart3,
  Home,
  Activity,
} from "lucide-react";

// Mock data for the dashboard
const recentGambles = [
  {
    id: "G-001",
    site: "nike.com",
    product: "Air Jordan 1 Retro",
    originalPrice: 200,
    gambleType: "50%",
    result: "win",
    finalPrice: 100,
    date: "2024-01-15",
    avatar: "/placeholder-mllqp.png",
  },
  {
    id: "G-002",
    site: "amazon.com",
    product: 'MacBook Pro 14"',
    originalPrice: 1999,
    gambleType: "25%",
    result: "loss",
    finalPrice: 1999,
    date: "2024-01-14",
    avatar: "/ripe-red-apple.png",
  },
  {
    id: "G-003",
    site: "bestbuy.com",
    product: "Sony WH-1000XM5",
    originalPrice: 399,
    gambleType: "Double or Nothing",
    result: "win",
    finalPrice: 0,
    date: "2024-01-13",
    avatar: "/sony.jpg",
  },
];

const weeklyData = [
  { day: "Mon", wins: 2, losses: 1, savings: 150 },
  { day: "Tue", wins: 1, losses: 2, savings: -200 },
  { day: "Wed", wins: 3, losses: 0, savings: 450 },
  { day: "Thu", wins: 1, losses: 1, savings: 75 },
  { day: "Fri", wins: 2, losses: 1, savings: 300 },
  { day: "Sat", wins: 0, losses: 2, savings: -150 },
  { day: "Sun", wins: 1, losses: 0, savings: 200 },
];

const gambleTypeData = [
  { name: "25%", value: 35, color: "#FF6B6B" },
  { name: "50%", value: 40, color: "#4ECDC4" },
  { name: "Double or Nothing", value: 15, color: "#45B7D1" },
  { name: "Custom", value: 10, color: "#96CEB4" },
];

export default function GamblingDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const totalSavings = recentGambles.reduce((acc, gamble) => {
    return acc + (gamble.originalPrice - gamble.finalPrice);
  }, 0);

  const winRate =
    (recentGambles.filter((g) => g.result === "win").length /
      recentGambles.length) *
    100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border p-4">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Dice1 className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-sidebar-foreground">Gamba</h1>
          </div>

          <nav className="space-y-2">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab("overview")}
            >
              <Home className="w-4 h-4" />
              Overview
            </Button>
            <Button
              variant={activeTab === "history" ? "default" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab("history")}
            >
              <Activity className="w-4 h-4" />
              Gamble History
            </Button>
            <Button
              variant={activeTab === "analytics" ? "default" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab("analytics")}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </nav>

          <div className="mt-auto pt-8">
            <Card className="bg-sidebar-accent">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="/abstract-geometric-shapes.png" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-sidebar-accent-foreground">
                      John Doe
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Premium User
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Dashboard
              </h2>
              <p className="text-muted-foreground">
                Track your gambling activity and savings
              </p>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Savings
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#4ECDC4" }}
                      >
                        ${totalSavings}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <TrendingUp className="inline w-3 h-3 mr-1" />
                        +12% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Win Rate
                      </CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">
                        {winRate.toFixed(1)}%
                      </div>
                      <Progress value={winRate} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Gambles
                      </CardTitle>
                      <Dice1 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {recentGambles.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Biggest Win
                      </CardTitle>
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#FF6B6B" }}
                      >
                        $1,999
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Sony Headphones
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Performance</CardTitle>
                      <CardDescription>
                        Your wins, losses, and savings over the week
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="wins" fill="#4ECDC4" name="Wins" />
                          <Bar dataKey="losses" fill="#FF6B6B" name="Losses" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Gamble Types</CardTitle>
                      <CardDescription>
                        Distribution of your gambling preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={gambleTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {gambleTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap gap-4 mt-4">
                        {gambleTypeData.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full shadow-sm"
                              style={{
                                backgroundColor: item.color,
                                boxShadow: `0 2px 4px ${item.color}40`,
                              }}
                            />
                            <span
                              className="text-sm font-medium"
                              style={{ color: item.color }}
                            >
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Gambles</CardTitle>
                    <CardDescription>
                      Your latest gambling activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentGambles.map((gamble) => (
                        <div
                          key={gamble.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage
                                src={gamble.avatar || "/placeholder.svg"}
                              />
                              <AvatarFallback>
                                {gamble.site[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{gamble.product}</p>
                              <p className="text-sm text-muted-foreground">
                                {gamble.site}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                gamble.result === "win"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {gamble.result === "win" ? "Won" : "Lost"}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {gamble.gambleType}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {gamble.result === "win" ? (
                                <span style={{ color: "#4ECDC4" }}>
                                  -${gamble.originalPrice - gamble.finalPrice}
                                </span>
                              ) : (
                                <span style={{ color: "#FF6B6B" }}>
                                  ${gamble.originalPrice}
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {gamble.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Gambling History</CardTitle>
                    <CardDescription>
                      All your gambling activities and results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Detailed history view coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Analytics</CardTitle>
                    <CardDescription>
                      Deep insights into your gambling patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Advanced analytics coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
