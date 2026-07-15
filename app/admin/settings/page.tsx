'use client';

import { useState } from 'react';
import { Save, Globe, Bell, Shield, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Platform Settings</h1>
        <p className="text-muted-foreground text-sm">Configure the GeoFredE-Terra State platform</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Company Name</Label>
                <Input defaultValue="GeoFredE-Terra State" />
              </div>
              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input defaultValue="https://geofred.com" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Contact Email</Label>
              <Input type="email" defaultValue="info@geofred.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Phone</Label>
              <Input defaultValue="+250 788 000 000" />
            </div>
            <div className="space-y-1.5">
              <Label>Office Address</Label>
              <Input defaultValue="KG 123 St, Gasabo District, Kigali, Rwanda" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'New agent registration', defaultChecked: true },
              { label: 'New service request', defaultChecked: true },
              { label: 'Property listing updates', defaultChecked: false },
              { label: 'Client complaints', defaultChecked: true },
            ].map(({ label, defaultChecked }) => (
              <label key={label} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked={defaultChecked} className="rounded" />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Session Timeout (minutes)</Label>
              <Input type="number" defaultValue={60} />
            </div>
            <div className="space-y-1.5">
              <Label>Max Login Attempts</Label>
              <Input type="number" defaultValue={5} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Require email verification for new accounts</span>
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="terra" className="gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" />
            {saved ? 'Saved!' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
