import React, { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Bell, CheckCheck, Clock, Flame, Package, ShieldCheck, X } from "lucide-react-native";
import { useNotifications } from "@/hooks/useStorefront";
import tw from "@/lib/tw";
import { colors } from "@/theme";

export default function NotificationModal({ visible, onClose }) {
  const { data: apiNotifs = [], isLoading } = useNotifications();
  const [readOverrides, setReadOverrides] = useState({});
  const [activeFilter, setActiveFilter] = useState("all");

  const notificationList = useMemo(() => {
    if (apiNotifs && Array.isArray(apiNotifs) && apiNotifs.length > 0) {
      return apiNotifs.map((n) => {
        const type = n.type || "system";
        let icon = Bell;
        let color = colors.brand;

        if (type.startsWith("order")) {
          icon = Package;
          color = colors.brand;
        } else if (type.startsWith("stock")) {
          icon = Flame;
          color = colors.red500;
        } else if (type.startsWith("review")) {
          icon = ShieldCheck;
          color = "#7c3aed";
        }

        return {
          id: n._id || n.id,
          type,
          title: n.title,
          desc: n.message || n.desc,
          time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "Just now",
          unread: readOverrides[n._id] !== undefined ? !readOverrides[n._id] : !n.read && !n.isRead,
          icon,
          color,
        };
      });
    }
    return [];
  }, [apiNotifs, readOverrides]);

  const filteredList = useMemo(() => {
    if (activeFilter === "unread") {
      return notificationList.filter((n) => n.unread);
    }
    if (activeFilter === "orders") {
      return notificationList.filter((n) => n.type.startsWith("order"));
    }
    if (activeFilter === "system") {
      return notificationList.filter((n) => !n.type.startsWith("order"));
    }
    return notificationList;
  }, [notificationList, activeFilter]);

  const unreadCount = useMemo(() => {
    return notificationList.filter((n) => n.unread).length;
  }, [notificationList]);

  const markAllAsRead = () => {
    const updated = {};
    notificationList.forEach((n) => {
      updated[n.id] = true;
    });
    setReadOverrides(updated);
  };

  const markItemAsRead = (id) => {
    setReadOverrides((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={tw("flex-1 justify-end items-center")}>
        {/* Backdrop: frosted glass blur outside screen with subtle mobile darkening */}
        <Pressable
          style={[
            tw("absolute inset-0"),
            {
              backgroundColor: "rgba(0, 0, 0, 0.35)",
              ...(Platform.OS === "web"
                ? {
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                  }
                : {}),
            },
          ]}
          onPress={onClose}
        >
          <View style={[tw("w-full h-full bg-black bg-opacity-25 mx-auto"), { maxWidth: 480 }]} />
        </Pressable>

        {/* Bottom Drawer constrained to mobile width */}
        <View
          style={[
            tw("w-full bg-surface rounded-t-3xl pt-3 pb-6 px-5 border-t border-gray-100 shadow-2xl"),
            { maxWidth: 480, maxHeight: "88%" },
          ]}
        >
          {/* Drawer Handle Pill */}
          <View style={tw("w-12 h-1.5 rounded-full bg-gray-300 self-center mb-3")} />

          {/* Header */}
          <View style={tw("flex-row justify-between items-center mb-3")}>
            <View style={tw("flex-row items-center gap-2")}>
              <View style={tw("w-8 h-8 rounded-full bg-emerald-50 items-center justify-center")}>
                <Bell size={16} color={colors.brand} />
              </View>
              <View>
                <Text style={tw("text-base font-extrabold text-gray-900")}>Notifications</Text>
                <Text style={tw("text-[11px] text-gray-500 font-medium")}>
                  {unreadCount > 0 ? `${unreadCount} unread updates` : "All caught up"}
                </Text>
              </View>
            </View>

            <View style={tw("flex-row items-center gap-2")}>
              {unreadCount > 0 && (
                <Pressable
                  onPress={markAllAsRead}
                  style={({ pressed }) => [
                    tw("flex-row items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-full cursor-pointer"),
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <CheckCheck size={12} color={colors.gray500} />
                  <Text style={tw("text-xs text-gray-500 font-bold")}>Mark Read</Text>
                </Pressable>
              )}

              <Pressable
                onPress={onClose}
                style={tw("w-8 h-8 rounded-full bg-gray-100 items-center justify-center cursor-pointer")}
              >
                <X size={16} color={colors.gray600} />
              </Pressable>
            </View>
          </View>

          {/* Filter Bar with Horizontal Scroll Option */}
          <View style={tw("mb-3")}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={tw("flex-row gap-2 py-0.5")}
            >
              {[
                { id: "all", label: `All (${notificationList.length})` },
                { id: "unread", label: `Unread (${unreadCount})` },
                { id: "orders", label: "Orders" },
                { id: "system", label: "Store & System" },
              ].map((tab) => {
                const isSelected = activeFilter === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => setActiveFilter(tab.id)}
                    style={[
                      tw(
                        "px-3 py-1.5 rounded-full border text-xs cursor-pointer",
                        isSelected
                          ? "bg-brand border-brand"
                          : "bg-gray-50 border-gray-200"
                      ),
                    ]}
                  >
                    <Text
                      style={[
                        tw("text-xs font-bold"),
                        isSelected ? tw("text-white") : tw("text-gray-700"),
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Notifications Scrollable List */}
          <ScrollView
            style={{ maxHeight: 400, minHeight: 180 }}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={tw("gap-2.5 pb-4")}
          >
            {isLoading ? (
              <View style={tw("py-12 items-center justify-center")}>
                <ActivityIndicator size="small" color={colors.brand} />
                <Text style={tw("text-xs text-gray-400 mt-2 font-medium")}>Loading updates...</Text>
              </View>
            ) : filteredList.length === 0 ? (
              <View style={tw("py-12 items-center justify-center")}>
                <Bell size={32} color={colors.gray300} />
                <Text style={tw("text-sm font-bold text-gray-700 mt-3")}>No notifications found</Text>
                <Text style={tw("text-xs text-gray-400 mt-1")}>
                  {activeFilter === "unread" ? "You have read all your notifications." : "No updates available right now."}
                </Text>
              </View>
            ) : (
              filteredList.map((item) => {
                const Icon = item.icon || Bell;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => markItemAsRead(item.id)}
                    style={[
                      tw("p-3.5 rounded-2xl border flex-row items-start gap-3 cursor-pointer"),
                      item.unread ? tw("bg-emerald-50/50 border-emerald-100") : tw("bg-surface border-gray-100"),
                    ]}
                  >
                    <View
                      style={[
                        tw("w-9 h-9 rounded-xl items-center justify-center shadow-xs"),
                        { backgroundColor: `${item.color}15` },
                      ]}
                    >
                      <Icon size={16} color={item.color} />
                    </View>

                    <View style={tw("flex-1")}>
                      <View style={tw("flex-row items-center justify-between")}>
                        <Text style={tw("text-xs font-bold text-gray-900 flex-1 pr-2")}>
                          {item.title}
                        </Text>
                        {item.unread && (
                          <View style={tw("w-2 h-2 rounded-full bg-brand")} />
                        )}
                      </View>
                      {!!item.desc && (
                        <Text style={tw("text-xs text-gray-600 mt-1 leading-4")}>
                          {item.desc}
                        </Text>
                      )}
                      <View style={tw("flex-row items-center gap-1 mt-2")}>
                        <Clock size={10} color={colors.gray400} />
                        <Text style={tw("text-[10px] text-gray-400 font-medium")}>{item.time}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          {/* Scroll Option Helper Bar */}
          {filteredList.length > 3 && (
            <View style={tw("pt-2 border-t border-gray-100 flex-row items-center justify-between")}>
              <Text style={tw("text-[11px] text-gray-400 font-medium")}>
                Showing {filteredList.length} updates
              </Text>
              <Text style={tw("text-[11px] text-brand font-semibold")}>
                Scroll for more ↕
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
