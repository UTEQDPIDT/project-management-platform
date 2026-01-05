'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useRouter } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Command, CommandGroup, CommandItem } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '../ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from '../ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';
import { eventSchema } from '@/schemas/event.schema';

interface EventFormProps {
  event?: string;
}

export default function EventForm({ event }: EventFormProps) {
  const router = useRouter();

  /**
   * Tanstack Hooks
   */

  const form = useForm({
    resolver: zodResolver(eventSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      summary: '',
      location: '',
      organization: '',
      date: undefined,
    },
  });

  /**
   * Handlers
   */

  const onSubmit = async (data: z.infer<typeof eventSchema>) => {
    try {
      const cleanedData = {
        ...data,
      };

      // mutations
      // form.reset();
      // router.push('/user/proyectos');
    } catch (err) {
      console.error('Error cleaning data', err);
    }
  };

  const onError = (errors: any) => {
    console.log('FORM ERRORS', errors);
  };

  return (
    <div>
      <form
        className="flex flex-col gap-6 md:w-2xl"
        onSubmit={form.handleSubmit(onSubmit, onError)}
      ></form>
    </div>
  );
}
