interface QuantityPickerProps {
  value: number;
  onChange: (next: number) => void;
}

export function QuantityPicker(props: QuantityPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="rounded border border-zinc-400 px-2 py-1 text-sm"
        onClick={() => props.onChange(props.value - 1)}
      >
        -
      </button>
      <input
        className="w-16 rounded border border-zinc-400 px-2 py-1 text-center"
        type="number"
        value={props.value}
        onChange={(event) => props.onChange(Number(event.target.value))}
      />
      <button
        type="button"
        className="rounded border border-zinc-400 px-2 py-1 text-sm"
        onClick={() => props.onChange(props.value + 1)}
      >
        +
      </button>
    </div>
  );
}
