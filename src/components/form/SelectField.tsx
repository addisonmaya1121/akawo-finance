import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const SelectField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  className,
  label,
  description,
  placeholder,
  values,
  required,
  onValueChange,
}: Omit<ControllerProps<TFieldValues, TName>, "render"> &
  React.HTMLAttributes<HTMLDivElement> & {
    label?: string;
    description?: JSX.Element | string | number;
    placeholder?: string;
    values: { value: string; label: string }[] | string[];
    required?: boolean;
    onValueChange?: (val: (typeof values)[number]) => void;
  }) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="capitalize" data-required={required}>
            {label || name.replaceAll("_", " ")}
          </FormLabel>
          <Select
            onValueChange={(val) => {
              onValueChange?.(val);
              field.onChange(val);
            }}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {values.map((value, key) =>
                typeof value === "string" ? (
                  <SelectItem key={key} value={value}>
                    {value}
                  </SelectItem>
                ) : (
                  <SelectItem key={key} value={value.value}>
                    {value.label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          {description && (
            <FormDescription className="text-primary">
              {description}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SelectField;
