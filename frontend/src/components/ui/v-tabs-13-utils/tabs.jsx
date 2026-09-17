import * as React from "react";
import { cn } from "../../../lib/utils";

const TabsContext = React.createContext({
  value: "",
  onValueChange: () => {},
  orientation: "vertical",
});

export const Tabs = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  orientation = "vertical",
  className,
  children,
  ...props
}) => {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || "");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = (newVal) => {
    if (!isControlled) {
      setUncontrolledValue(newVal);
    }
    onValueChange?.(newVal);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange, orientation }}>
      <div
        className={cn(
          "flex",
          orientation === "vertical" ? "flex-col sm:flex-row gap-6" : "flex-col gap-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className, children, ...props }) => {
  const { orientation } = React.useContext(TabsContext);

  return (
    <div
      className={cn(
        "flex",
        orientation === "vertical"
          ? "flex-row sm:flex-col gap-1.5 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          : "flex-row gap-1.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const TabsTab = ({ value: tabValue, className, children, ...props }) => {
  const { value, onValueChange, orientation } = React.useContext(TabsContext);
  const isActive = value === tabValue;

  return (
    <button
      type="button"
      onClick={() => onValueChange(tabValue)}
      className={cn(
        "relative flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2 text-sm font-medium transition-all text-left rounded-lg outline-none whitespace-nowrap",
        isActive
          ? "text-[#ff3b19] font-bold bg-[#fff1ee] sm:bg-[#fff1ee]/70"
          : "text-slate-600 hover:text-[#ff3b19] hover:bg-[#fbf9f4]",
        // Vertical active indicator line on the left on desktop
        orientation === "vertical" &&
          isActive &&
          "sm:before:absolute sm:before:left-0 sm:before:top-1 sm:before:bottom-1 sm:before:w-[3px] sm:before:bg-[#ff3b19] sm:before:rounded-r-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsPanel = ({ value: panelValue, className, children, ...props }) => {
  const { value } = React.useContext(TabsContext);

  if (value !== panelValue) return null;

  return (
    <div className={cn("flex-1 outline-none animate-in fade-in-50 duration-200", className)} {...props}>
      {children}
    </div>
  );
};
