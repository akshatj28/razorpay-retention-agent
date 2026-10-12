import { ActionList, ActionListItem, Dropdown, DropdownOverlay, SelectInput } from "@razorpay/blade/components";

export function SelectField({ label, value, options, onChange, isDisabled = false, accessibilityLabel }: {
  label?: string;
  accessibilityLabel?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  isDisabled?: boolean;
}) {
  return <Dropdown selectionType="single">
    <SelectInput {...(label ? { label } : {})} accessibilityLabel={accessibilityLabel ?? label ?? "Select an option"}
      value={value} isDisabled={isDisabled} size="medium"
      onChange={({ values }) => { if (values[0] !== undefined) onChange(values[0]); }} />
    <DropdownOverlay><ActionList>{options.map((option) =>
      <ActionListItem key={option.value} value={option.value} title={option.label} />
    )}</ActionList></DropdownOverlay>
  </Dropdown>;
}
