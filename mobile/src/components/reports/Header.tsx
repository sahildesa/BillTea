import React from "react";
import { SegmentedControl } from "../ui/SegmentedControl";

type Props = {
  selected: "invoice" | "profit";
  onChange: (value: "invoice" | "profit") => void;
};

export default function Header({
  selected,
  onChange,
}: Props) {
  return (
    <SegmentedControl
      options={["Invoice Report", "Profit Report"]}
      activeOption={
        selected === "invoice"
          ? "Invoice Report"
          : "Profit Report"
      }
      onOptionChange={(option) =>
        onChange(
          option === "Invoice Report"
            ? "invoice"
            : "profit"
        )
      }
    />
  );
}