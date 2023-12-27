import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../ui/form";
import { Input } from "../ui/input";

const TextField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  className,
  input,
  label,
  description,
}: Omit<ControllerProps<TFieldValues, TName>, "render"> &
  React.HTMLAttributes<HTMLDivElement> & {
    label?: string;
    input?: React.InputHTMLAttributes<HTMLInputElement>;
    description?: string | JSX.Element;
  }) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, ...field } }) => (
        <FormItem className={className}>
          <FormLabel className="capitalize">
            {label || name.replaceAll("_", " ")}
          </FormLabel>
          <FormControl>
            <Input value={value || ""} {...input} {...field} />
          </FormControl>
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

export default TextField;
