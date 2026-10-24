import React from "react";
import { Text, TextInput, View } from "react-native";
import tw from "@/lib/tw";
import { colors } from "@/theme";

export default function FormField({ label, icon: Icon, optional, style, inputStyle, ...inputProps }) {
  return (
    <View style={style}>
      <Text style={[tw("font-bold text-gray-700 mb-1.5"), { fontSize: 11 }]}>
        {label}
        {optional && <Text style={tw("text-gray-400 font-medium")}> (optional)</Text>}
      </Text>
      <View
        style={[
          tw("flex-row items-center gap-2 px-3 rounded-xl"),
          { minHeight: 46, backgroundColor: colors.gray50, borderWidth: 1, borderColor: colors.gray100 },
        ]}
      >
        {Icon && <Icon size={16} color={colors.gray400} />}
        <TextInput
          placeholderTextColor={colors.gray400}
          {...inputProps}
          style={[tw("flex-1 text-sm text-gray-900 font-medium"), { paddingVertical: 10 }, inputStyle]}
        />
      </View>
    </View>
  );
}
