import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

type EventItem = {
  title: string;
  status: 'LIVE' | 'UPCOMING' | 'ENDED';
  description: string;
  reward: string;
  duration: number;
  progress: number;
  participants: string;
  icon: string;
};

const EVENTS: EventItem[] = [
  {
    title: 'SEEKER LAUNCH RUN',
    status: 'LIVE',
    description: 'Complete quests and mini games to climb the event board.',
    reward: '2X XP',
    duration: 23 * 60 * 60 + 41 * 60,
    progress: 60,
    participants: '1,284 players',
    icon: '⚡',
  },
  {
    title: 'WEEKEND EXPLORER',
    status: 'UPCOMING',
    description: 'Discover Seeker ecosystem experiences and unlock an event badge.',
    reward: 'BADGE',
    duration: 2 * 24 * 60 * 60 + 8 * 60 * 60,
    progress: 0,
    participants: 'Starts Saturday',
    icon: '◈',
  },
  {
    title: 'SKR QUIZ CUP',
    status: 'UPCOMING',
    description: 'Compete in a fast Seeker knowledge challenge.',
    reward: '750 XP',
    duration: 4 * 24 * 60 * 60,
    progress: 0,
    participants: 'Registration soon',
    icon: '?',
  },
  {
    title: 'QUEST RUSH',
    status: 'UPCOMING',
    description: 'Finish as many daily tasks as possible before the event timer ends.',
    reward: '1,000 XP',
    duration: 6 * 24 * 60 * 60,
    progress: 0,
    participants: 'Registration soon',
    icon: '◆',
  },
];

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours}h ${minutes}m ${secs}s`;
}

export default function EventsScreen() {
  const [filter, setFilter] = useState<'ALL' | 'LIVE' | 'UPCOMING' | 'ENDED'>('ALL');

  const [remaining, setRemaining] = useState<Record<string, number>>(
    Object.fromEntries(
      EVENTS.map((event) => [event.title, event.duration])
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
    return EVENTS.filter((event) => event.status === filter);
  }, [filter]);

  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.eyebrow}>THE SEEKER</Text>
      <Text style={s.title}>Events</Text>
      <Text style={s.sub}>
        Limited-time challenges, special quests and exclusive rewards.
      </Text>

      <View style={s.stats}>
        <View style={s.stat}>
          <Text style={s.statNumber}>01</Text>
          <Text style={s.statLabel}>LIVE NOW</Text>
        </View>

        <View style={s.stat}>
          <Text style={s.statNumber}>03</Text>
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
      >
        {(['ALL', 'LIVE', 'UPCOMING', 'ENDED'] as const).map((item) => (
          <Pressable
            key={item}
            style={[s.filter, filter === item && s.filterActive]}
            onPress={() => setFilter(item)}
          >
            <Text
              style={[
                s.filterText,
                filter === item && s.filterTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {filteredEvents.map((event) => {
        const time = remaining[event.title] ?? event.duration;

        return (
          <View key={event.title} style={s.event}>
            <View style={s.eventTop}>
              <View style={s.eventIcon}>
                <Text style={s.eventIconText}>{event.icon}</Text>
              </View>

              <View style={s.eventTopText}>
                <Text
                  style={[
                    s.status,
                    event.status === 'UPCOMING' && s.statusUpcoming,
                    event.status === 'ENDED' && s.statusEnded,
                  ]}
                >
                  {event.status}
                </Text>

                <Text style={s.eventTitle}>{event.title}</Text>
              </View>

              <View style={s.reward}>
                <Text style={s.rewardText}>{event.reward}</Text>
              </View>
            </View>

            <Text style={s.desc}>{event.description}</Text>

            {event.status === 'LIVE' && (
              <>
                <View style={s.progressRow}>
                  <Text style={s.progressLabel}>EVENT PROGRESS</Text>
                  <Text style={s.progressValue}>
                    {event.progress}%
                  </Text>
                </View>

                <View style={s.progressTrack}>
                  <View
                    style={[
                      s.progressFill,
                      { width: `${event.progress}%` },
                    ]}
                  />
                </View>
              </>
            )}

            <View style={s.details}>
              <View>
                <Text style={s.detailLabel}>
                  {event.status === 'LIVE' ? 'ENDS IN' : 'TIME'}
                </Text>

                <Text style={s.time}>
                  {event.status === 'ENDED'
                    ? 'Event finished'
                    : formatTime(time)}
                </Text>
              </View>

              <View style={s.players}>
                <Text style={s.detailLabel}>PLAYERS</Text>
                <Text style={s.time}>{event.participants}</Text>
              </View>
            </View>

            <View style={s.actions}>
              <Pressable
                style={s.primaryButton}
                onPress={() => router.push('/tasks' as any)}
              >
                <Text style={s.primaryText}>
                  {event.status === 'LIVE'
                    ? 'JOIN EVENT'
                    : 'VIEW EVENT'}
                </Text>
              </Pressable>

              <Pressable
                style={s.secondaryButton}
                onPress={() =>
                  router.push('/leaderboard' as any)
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
          <Text style={s.emptyTitle}>No events here yet</Text>
          <Text style={s.emptyText}>
            Check another event category or come back later.
          </Text>
        </View>
      )}

      <View style={s.rule}>
        <Text style={s.ruleIcon}>SKR</Text>

        <View style={s.ruleBody}>
          <Text style={s.ruleTitle}>EVENT ACCESS</Text>

          <Text style={s.ruleText}>
            Connect a compatible Solana wallet before participating.
            Your event progress can then be linked to your Seeker profile.
          </Text>
        </View>
      </View>

      <View style={s.footer}>
        <Text style={s.footerTitle}>
          MORE EVENTS ARE COMING
        </Text>

        <Text style={s.footerText}>
          Keep completing quests, playing games and building your profile.
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

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  progressLabel: {
    color: '#697793',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  progressValue: {
    color: '#58bdff',
    fontSize: 10,
    fontWeight: '900',
  },

  progressTrack: {
    height: 7,
    backgroundColor: '#172037',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 7,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#2684ff',
    borderRadius: 10,
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

