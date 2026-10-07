import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export type EventItem = {
  id: string;
  title: string;
  status: 'LIVE' | 'UPCOMING' | 'ENDED';
  description: string;
  reward: string;
  duration: number;
  participants: string;
  icon: string;
  boost: string;
};

export const EVENTS: EventItem[] = [
  {
    id: 'seeker-launch-run',
    title: 'SEEKER LAUNCH RUN',
    status: 'LIVE',
    description:
      'Complete event quests, play games and earn event XP to climb the event leaderboard.',
    reward: '2X XP',
    duration: 23 * 60 * 60 + 41 * 60,
    participants: '1,284 players',
    icon: '⚡',
    boost: '2X',
  },
  {
    id: 'weekend-explorer',
    title: 'WEEKEND EXPLORER',
    status: 'UPCOMING',
    description:
      'Discover Seeker ecosystem experiences and unlock an exclusive event badge.',
    reward: 'BADGE',
    duration: 2 * 24 * 60 * 60 + 8 * 60 * 60,
    participants: 'Starts Saturday',
    icon: '◈',
    boost: '1.5X',
  },
  {
    id: 'skr-quiz-cup',
    title: 'SKR QUIZ CUP',
    status: 'UPCOMING',
    description:
      'Compete in a fast Seeker knowledge challenge and fight for the top spots.',
    reward: '750 XP',
    duration: 4 * 24 * 60 * 60,
    participants: 'Registration soon',
    icon: '?',
    boost: '2X',
  },
  {
    id: 'quest-rush',
    title: 'QUEST RUSH',
    status: 'UPCOMING',
    description:
      'Finish as many event activities as possible before the event timer ends.',
    reward: '1,000 XP',
    duration: 6 * 24 * 60 * 60,
    participants: 'Registration soon',
    icon: '◆',
    boost: '3X',
  },
];

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  return `${hours}h ${minutes}m ${secs}s`;
}

export default function EventsScreen() {
  const [filter, setFilter] =
    useState<'ALL' | 'LIVE' | 'UPCOMING' | 'ENDED'>('ALL');

  const [remaining, setRemaining] = useState<Record<string, number>>(
    Object.fromEntries(
      EVENTS.map((event) => [event.id, event.duration])
    )
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((current) => {
        const next = { ...current };

        Object.keys(next).forEach((key) => {
          next[key] = Math.max(0, next[key] - 1);
        });

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const filteredEvents = useMemo(() => {
    if (filter === 'ALL') return EVENTS;

    return EVENTS.filter(
      (event) => event.status === filter
    );
  }, [filter]);

  const liveCount = EVENTS.filter(
    (event) => event.status === 'LIVE'
  ).length;

  const upcomingCount = EVENTS.filter(
    (event) => event.status === 'UPCOMING'
  ).length;

  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    ><View nativeID="SEEKER_BACK_HOME_EVENTS" style={{ marginBottom: 4 }}>
  <Pressable
    onPress={() => router.replace('/home')}
    style={{
      alignSelf: 'flex-start',
      paddingVertical: 8,
      paddingHorizontal: 2,
      marginBottom: 8,
    }}
  >
    <Text style={{ color: '#7F8DA8', fontSize: 13, fontWeight: '800' }}>
      ← Back Home
    </Text>
  </Pressable>
</View>

      <Text style={s.eyebrow}>THE SEEKER</Text>

      <Text style={s.title}>Events</Text>

      <Text style={s.sub}>
        Limited-time challenges, event quests, leaderboards and rewards.
      </Text>

      <View style={s.stats}>
        <View style={s.stat}>
          <Text style={s.statNumber}>
            {String(liveCount).padStart(2, '0')}
          </Text>

          <Text style={s.statLabel}>LIVE NOW</Text>
        </View>

        <View style={s.stat}>
          <Text style={s.statNumber}>
            {String(upcomingCount).padStart(2, '0')}
          </Text>

          <Text style={s.statLabel}>UPCOMING</Text>
        </View>

        <View style={s.stat}>
          <Text style={s.statNumber}>2X</Text>

          <Text style={s.statLabel}>XP BOOST</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filters}
      ><View nativeID="SEEKER_BACK_HOME_EVENTS" style={{ marginBottom: 4 }}>
  <Pressable
    onPress={() => router.replace('/home')}
    style={{
      alignSelf: 'flex-start',
      paddingVertical: 8,
      paddingHorizontal: 2,
      marginBottom: 8,
    }}
  >
    <Text style={{ color: '#7F8DA8', fontSize: 13, fontWeight: '800' }}>
      ← Back Home
    </Text>
  </Pressable>
</View>

        {(['ALL', 'LIVE', 'UPCOMING', 'ENDED'] as const).map(
          (item) => (
            <Pressable
              key={item}
              style={[
                s.filter,
                filter === item && s.filterActive,
              ]}
              onPress={() => setFilter(item)}
            >
              <Text
                style={[
                  s.filterText,
                  filter === item &&
                    s.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          )
        )}
      </ScrollView>

      {filteredEvents.map((event) => {
        const time =
          remaining[event.id] ?? event.duration;

        return (
          <View key={event.id} style={s.event}>
            <View style={s.eventTop}>
              <View style={s.eventIcon}>
                <Text style={s.eventIconText}>
                  {event.icon}
                </Text>
              </View>

              <View style={s.eventTopText}>
                <Text
                  style={[
                    s.status,
                    event.status === 'UPCOMING' &&
                      s.statusUpcoming,
                    event.status === 'ENDED' &&
                      s.statusEnded,
                  ]}
                >
                  {event.status}
                </Text>

                <Text style={s.eventTitle}>
                  {event.title}
                </Text>
              </View>

              <View style={s.reward}>
                <Text style={s.rewardText}>
                  {event.reward}
                </Text>
              </View>
            </View>

            <Text style={s.desc}>
              {event.description}
            </Text>

            <View style={s.boostRow}>
              <View style={s.boostBadge}>
                <Text style={s.boostText}>
                  {event.boost} XP
                </Text>
              </View>

              <Text style={s.eventType}>
                EVENT CHALLENGE
              </Text>
            </View>

            <View style={s.details}>
              <View>
                <Text style={s.detailLabel}>
                  {event.status === 'LIVE'
                    ? 'ENDS IN'
                    : 'TIME'}
                </Text>

                <Text style={s.time}>
                  {event.status === 'ENDED'
                    ? 'Event finished'
                    : formatTime(time)}
                </Text>
              </View>

              <View style={s.players}>
                <Text style={s.detailLabel}>
                  PLAYERS
                </Text>

                <Text style={s.time}>
                  {event.participants}
                </Text>
              </View>
            </View>

            <View style={s.actions}>
              <Pressable
                style={s.primaryButton}
                onPress={() =>
                  router.push({
                    pathname: '/event-detail',
                    params: {
                      id: event.id,
                    },
                  })
                }
              >
                <Text style={s.primaryText}>
                  {event.status === 'LIVE'
                    ? 'ENTER EVENT'
                    : 'VIEW EVENT'}
                </Text>
              </Pressable>

              <Pressable
                style={s.secondaryButton}
                onPress={() =>
                  router.push({
                    pathname: '/event-detail',
                    params: {
                      id: event.id,
                      section: 'leaderboard',
                    },
                  })
                }
              >
                <Text style={s.secondaryText}>
                  LEADERBOARD
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      {filteredEvents.length === 0 && (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>◇</Text>

          <Text style={s.emptyTitle}>
            No events here yet
          </Text>

          <Text style={s.emptyText}>
            Check another event category or come back later.
          </Text>
        </View>
      )}

      <View style={s.rule}>
        <Text style={s.ruleIcon}>SKR</Text>

        <View style={s.ruleBody}>
          <Text style={s.ruleTitle}>
            EVENT ACCESS
          </Text>

          <Text style={s.ruleText}>
            Connect a compatible Solana wallet before
            participating. Event progress is kept separately
            from your normal daily tasks.
          </Text>
        </View>
      </View>

      <View style={s.footer}>
        <Text style={s.footerTitle}>
          MORE EVENTS ARE COMING
        </Text>

        <Text style={s.footerText}>
          Keep seeking. New challenges can appear over time.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#050814',
  },

  content: {
    padding: 20,
    paddingBottom: 60,
  },

  eyebrow: {
    color: '#42afff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 18,
  },

  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 3,
  },

  sub: {
    color: '#8995ae',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 7,
  },

  stats: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },

  stat: {
    flex: 1,
    backgroundColor: '#0c1224',
    borderWidth: 1,
    borderColor: '#1d3157',
    borderRadius: 16,
    padding: 14,
  },

  statNumber: {
    color: '#55baff',
    fontSize: 20,
    fontWeight: '900',
  },

  statLabel: {
    color: '#71809d',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 4,
  },

  filters: {
    gap: 8,
    paddingVertical: 18,
  },

  filter: {
    borderWidth: 1,
    borderColor: '#25365a',
    backgroundColor: '#0a1020',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },

  filterActive: {
    backgroundColor: '#176cff',
    borderColor: '#176cff',
  },

  filterText: {
    color: '#71809d',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  filterTextActive: {
    color: '#fff',
  },

  event: {
    backgroundColor: '#0c1224',
    borderWidth: 1,
    borderColor: '#20345b',
    borderRadius: 22,
    padding: 18,
    marginBottom: 15,
  },

  eventTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  eventIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#142b57',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  eventIconText: {
    color: '#55bdff',
    fontSize: 23,
    fontWeight: '900',
  },

  eventTopText: {
    flex: 1,
  },

  status: {
    color: '#49d2a7',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },

  statusUpcoming: {
    color: '#a8a7ff',
  },

  statusEnded: {
    color: '#65718b',
  },

  eventTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 4,
  },

  reward: {
    backgroundColor: '#172b52',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginLeft: 8,
  },

  rewardText: {
    color: '#5ec1ff',
    fontSize: 9,
    fontWeight: '900',
  },

  desc: {
    color: '#7e8ba5',
    lineHeight: 20,
    marginTop: 14,
  },

  boostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 13,
  },

  boostBadge: {
    backgroundColor: '#102d4c',
    borderWidth: 1,
    borderColor: '#1d638c',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  boostText: {
    color: '#55c8ff',
    fontSize: 9,
    fontWeight: '900',
  },

  eventType: {
    color: '#596984',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginLeft: 9,
  },

  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 17,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#17233d',
  },

  players: {
    alignItems: 'flex-end',
  },

  detailLabel: {
    color: '#66748f',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  time: {
    color: '#b7c1d4',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },

  actions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 16,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: '#176cff',
    paddingVertical: 12,
    borderRadius: 13,
    alignItems: 'center',
  },

  primaryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },

  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#29406c',
    paddingVertical: 12,
    borderRadius: 13,
    alignItems: 'center',
  },

  secondaryText: {
    color: '#81bfff',
    fontSize: 10,
    fontWeight: '900',
  },

  empty: {
    alignItems: 'center',
    paddingVertical: 50,
  },

  emptyIcon: {
    color: '#3d9fff',
    fontSize: 40,
  },

  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
  },

  emptyText: {
    color: '#73809a',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },

  rule: {
    flexDirection: 'row',
    backgroundColor: '#11142c',
    borderWidth: 1,
    borderColor: '#2d3971',
    borderRadius: 19,
    padding: 17,
    marginTop: 5,
  },

  ruleIcon: {
    color: '#a8a7ff',
    fontSize: 19,
    fontWeight: '900',
    marginRight: 14,
  },

  ruleBody: {
    flex: 1,
  },

  ruleTitle: {
    color: '#a8a7ff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  ruleText: {
    color: '#8995ae',
    lineHeight: 19,
    fontSize: 12,
    marginTop: 5,
  },

  footer: {
    alignItems: 'center',
    paddingTop: 28,
  },

  footerTitle: {
    color: '#52627e',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  footerText: {
    color: '#3f4d66',
    fontSize: 11,
    marginTop: 6,
  },
});



