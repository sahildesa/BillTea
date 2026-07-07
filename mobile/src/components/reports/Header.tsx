import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SegmentedControl } from "../ui/SegmentedControl";

export default function Header() {
  const [selected, setSelected] = useState<"invoice" | "profit">("invoice");

  return (
    <>
      {/* Toggle */}
      <SegmentedControl
        options={["Invoice Report", "Profit Report"]}
        activeOption={selected === "invoice" ? "Invoice Report" : "Profit Report"}
        onOptionChange={(opt) => setSelected(opt === "Invoice Report" ? "invoice" : "profit")}
      />
    </>
  );
}

const styles = StyleSheet.create({});