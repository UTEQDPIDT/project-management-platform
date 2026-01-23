import { mongoId } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { IUser } from '@repo/types';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import {
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '../ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandGroup, CommandItem } from '../ui/command';
import LoadingMessage from '../loading-message';
import { ProfileInfo } from '../profile-info';
import { useGetAllUsers } from '@/hooks/user';
import { DialogClose } from '../ui/dialog';
import { useAddParticipants } from '@/hooks/events';

interface ParticipantsFormProps {
  eventId: string;
  participants: IUser[];
}

const schema = z.object({
  participants: z.array(mongoId),
});

export function ParticipantsForm({
  eventId,
  participants,
}: ParticipantsFormProps) {
  const { data: users, isLoading: loadingUsers } = useGetAllUsers();
  const addParticipants = useAddParticipants();

  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      participants: participants ? participants.map((p) => p._id) : [],
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    addParticipants.mutate({ eventId, userIds: data });
  };

  const onError = (errors: any) => {
    console.log('FORM ERRORS', errors);
  };
  return (
    <form
      className="flex flex-col gap-10"
      onSubmit={form.handleSubmit(onSubmit, onError)}
    >
      <Controller
        control={form.control}
        name="participants"
        render={({ field }) => {
          const value = field.value ?? [];

          return (
            <FieldGroup>
              <FieldContent>
                <FieldLabel>Usuarios</FieldLabel>
                <FieldDescription>
                  Selecciona a cuantos usuarios quieras.
                </FieldDescription>
              </FieldContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal"
                  >
                    {value.length ? (
                      `${value.length} seleccionados`
                    ) : (
                      <span className="text-muted-foreground font-normal">
                        Sin selección
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full md:w-md max-h-96 overflow-y-auto p-0">
                  <Command>
                    <CommandGroup>
                      {loadingUsers ? (
                        <CommandItem disabled>
                          <LoadingMessage />
                        </CommandItem>
                      ) : users.length > 0 ? (
                        users.map((user: IUser) => {
                          const selected = value.includes(user._id);

                          return (
                            <CommandItem
                              key={user._id}
                              onSelect={() => {
                                field.onChange(
                                  selected
                                    ? value.filter((v) => v !== user._id)
                                    : [...value, user._id],
                                );
                              }}
                              className="flex justify-between items-center"
                            >
                              <ProfileInfo
                                givenName={user.givenName}
                                familyName={user.familyName}
                                avatarUrl={user.avatarUrl}
                                userType={user.type}
                                size="sm"
                              />
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selected ? 'opacity-100' : 'opacity-0'
                                }`}
                              />
                            </CommandItem>
                          );
                        })
                      ) : (
                        <div className="w-full select-none p-2 flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">
                            No se encontraron usuarios.
                          </span>
                        </div>
                      )}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </FieldGroup>
          );
        }}
      />

      <div className="flex gap-2">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DialogClose>

        <DialogClose asChild>
          <Button type="submit" disabled={addParticipants.isPending}>
            Aceptar
          </Button>
        </DialogClose>
      </div>
    </form>
  );
}
