'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { UpdateUser, updateUserSchema } from '@/schemas/update-user.schema';

import React from 'react';

export default function UserForm() {
  const form = useForm<UpdateUser>({
    resolver: zodResolver(updateUserSchema),
  });

  const onSubmit = (data: UpdateUser) => {
    // handle user update
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}></form>;
}
