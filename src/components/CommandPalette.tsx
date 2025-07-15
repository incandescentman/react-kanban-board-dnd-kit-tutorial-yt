import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";

interface Command {
  id: string;
  label: string;
  description: string;
  action: () => void;
  shortcut?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

function CommandPalette({ isOpen, onClose, commands }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredCommands = commands.filter(command =>
    command.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <CommandList>
        {filteredCommands.length === 0 ? (
          <CommandEmpty>No results found.</CommandEmpty>
        ) : (
          <CommandGroup heading="Commands">
            {filteredCommands.map((command) => (
              <CommandItem
                key={command.id}
                onSelect={() => {
                  command.action();
                  onClose();
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{command.label}</span>
                  <span className="text-sm text-muted-foreground">{command.description}</span>
                </div>
                {command.shortcut && (
                  <CommandShortcut>{command.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export default CommandPalette;