'use client';

import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/ui/select-field';
import { PasswordInput } from '@/features/auth/ui/PasswordInput';

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-9">
      <div className="flex flex-col gap-9">
        <SelectField
          label="Theme"
          placeholder="Select theme"
          value="Device settings"
          options={[
            { value: 'Device settings', label: 'Device settings' },
            { value: 'Dark', label: 'Dark' },
            { value: 'Light', label: 'Light' },
          ]}
          onChange={(value) => console.log('Selected theme:', value)}
        />

        <SelectField
          label="Language"
          placeholder="Select language"
          value="en"
          options={[
            { value: 'en', label: 'English' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'it', label: 'Italian' },
            { value: 'pl', label: 'Polish' },
            { value: 'pt', label: 'Portuguese' },
            { value: 'ru', label: 'Russian' },
            { value: 'es', label: 'Spanish' },
            { value: 'uk', label: 'Ukrainian' },
          ]}
          onChange={(value) => console.log('Selected language:', value)}
        />
      </div>

      <div className="flex flex-col gap-6">
        <p className="text-m">Change password</p>
        <div className="flex flex-col gap-9">
          <PasswordInput placeholder="Password" value="" onChange={() => {}} />
          <PasswordInput placeholder="New password" value="" onChange={() => {}} />
          <PasswordInput placeholder="Confirm password" value="" onChange={() => {}} />
          <Button
            variant="primary"
            className="ml-auto w-40"
            onClick={() => console.log('Change password clicked')}
          >
            Change
          </Button>
        </div>
      </div>
    </div>
  );
}
